#pragma once

#include <cmath>
#include <functional>
#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>
#include <vector>

#include <jsi/jsi.h>

#include "JsiValueWrapper.h"
#include "RNSkView.h"

#include "JsiSkPicture.h"
#include "RNSkInfoParameter.h"
#include "RNSkLog.h"
#include "RNSkPlatformContext.h"
#include "RNSkTime.h"
#include "RNSkTimingInfo.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "JsiSkSkottie.h"
#include "SkBBHFactory.h"
#include "SkCanvas.h"
#include "SkPictureRecorder.h"
#include <modules/skottie/include/Skottie.h>

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class RNSkSkottieRenderer : public RNSkRenderer, public std::enable_shared_from_this<RNSkSkottieRenderer> {
public:
  RNSkSkottieRenderer(std::function<void()> requestRedraw, std::shared_ptr<RNSkPlatformContext> context)
      : RNSkRenderer(requestRedraw), _platformContext(context) {}

  bool tryRender(std::shared_ptr<RNSkCanvasProvider> canvasProvider) override {
    return performDraw(canvasProvider);
  }

  void renderImmediate(std::shared_ptr<RNSkCanvasProvider> canvasProvider) override {
    performDraw(canvasProvider);
  }

  void setSrc(std::shared_ptr<jsi::HostObject> animation) {
    if (animation == nullptr) {
      _animation = nullptr;
    } else {
      _animation = std::dynamic_pointer_cast<JsiSkSkottie>(animation);
      _srcR = SkRect::MakeSize(_animation->getObject()->size());
      // Seek to the first frame:
      _animation->getObject()->seekFrame(0);
    }
  }

  void setProgress(double progress) {
    if (_animation == nullptr) {
      return;
    }

    _animation->getObject()->seek(progress);
  }

  void setStartTime(double startTime) {
    if (_lastPauseTime > 0.0 && startTime > -1.0) {
      _totalPausedDuration += RNSkTime::GetSecs() - _lastPauseTime;
      _lastPauseTime = 0.0;
    } else {
      _startTime = startTime;
    }
  }

  void setResizeMode(std::string resizeMode) {
    _resizeMode = resizeMode;
  }

  bool isPaused() {
    return _lastPauseTime > 0.0;
  }

  void pause() {
    if (isPaused()) {
      // We are already paused
      return;
    }

    _lastPauseTime = RNSkTime::GetSecs();
  }

private:
  bool performDraw(std::shared_ptr<RNSkCanvasProvider> canvasProvider) {
    canvasProvider->renderToCanvas([=](SkCanvas* canvas) {
      // Make sure to scale correctly
      auto pd = _platformContext->getPixelDensity();
      canvas->clear(SK_ColorTRANSPARENT);
      canvas->save();
      canvas->scale(pd, pd);

      if (_animation != nullptr) {
        auto dstRect = canvas->getLocalClipBounds();

        // Defaults to "contain"
        SkMatrix::ScaleToFit scaleType = SkMatrix::kCenter_ScaleToFit;
        if (_resizeMode == "stretch") {
          scaleType = SkMatrix::kFill_ScaleToFit;
        }

        if (_resizeMode == "cover") {
          auto scale = std::max(dstRect.width() / _srcR.width(), dstRect.height() / _srcR.height());
          auto scaledWidth = _srcR.width() * scale;
          auto scaledHeight = _srcR.height() * scale;
          auto x = (dstRect.width() - scaledWidth) / 2;
          auto y = (dstRect.height() - scaledHeight) / 2;

          dstRect = SkRect::MakeXYWH(x, y, scaledWidth, scaledHeight);
          scaleType = SkMatrix::kCenter_ScaleToFit;
        }

        //          skottie::Animation::RenderFlags flags = skottie::Animation::RenderFlag::kDisableTopLevelClipping |
        //          skottie::Animation::RenderFlag::kSkipTopLevelIsolation; _animation->getObject()->render(canvas, &dstRect, flags);

        canvas->concat(SkMatrix::RectToRect(_srcR, dstRect, scaleType));
        _animation->getObject()->render(canvas);
      }

      canvas->restore();
    });

    // Seek to next frame, happens after render to give us 16.7ms to create it
    if (_startTime != -1.0 && _animation != nullptr) {
      auto timeNow = RNSkTime::GetSecs();
      auto timePassed = timeNow - _startTime - _totalPausedDuration;
      auto duration = _animation->getObject()->duration();
      if (timePassed > duration) {
        setStartTime(timeNow);
        timePassed = 0.0;

        // Reset paused values for cleanup
        _lastPauseTime = 0.0;
        _totalPausedDuration = 0.0;
      }

      _animation->getObject()->seekFrameTime(timePassed);
    }

    return true;
  }

  std::shared_ptr<RNSkPlatformContext> _platformContext;
  std::shared_ptr<JsiSkSkottie> _animation;
  SkRect _srcR;
  std::string _resizeMode = "contain";
  double _startTime = -1.0;
  double _lastPauseTime = 0.0;
  double _totalPausedDuration = 0.0;
};

class RNSkSkottieView : public RNSkView {
public:
  /**
   * Constructor
   */
  RNSkSkottieView(std::shared_ptr<RNSkPlatformContext> context, std::shared_ptr<RNSkCanvasProvider> canvasProvider)
      : RNSkView(context, canvasProvider,
                 std::make_shared<RNSkSkottieRenderer>(std::bind(&RNSkSkottieView::requestRedraw, this), context)) {}

  void setJsiProperties(std::unordered_map<std::string, RNJsi::JsiValueWrapper>& props) override {

    RNSkView::setJsiProperties(props);

    for (auto& prop : props) {
      if (prop.first == "src" && prop.second.getType() == RNJsi::JsiWrapperValueType::HostObject) {
        std::static_pointer_cast<RNSkSkottieRenderer>(getRenderer())->setSrc(prop.second.getAsHostObject());
        renderImmediate(); // Draw the first frame
      }
      if (prop.first == "scaleType") {
        std::static_pointer_cast<RNSkSkottieRenderer>(getRenderer())->setResizeMode(prop.second.getAsString());
      }
    }
  }

  jsi::Value callJsiMethod(jsi::Runtime& runtime, const std::string& name, const jsi::Value* arguments, size_t count) override {
    if (name == "setProgress") {
      // Get first argument as number as it contains the updated value
      auto progressValue = arguments[0].asNumber();
      std::static_pointer_cast<RNSkSkottieRenderer>(getRenderer())->setProgress(progressValue);
      requestRedraw();
    } else if (name == "start") {
      std::static_pointer_cast<RNSkSkottieRenderer>(getRenderer())->setStartTime(RNSkTime::GetSecs());
      setDrawingMode(RNSkDrawingMode::Continuous);
    } else if (name == "pause") {
      if (std::static_pointer_cast<RNSkSkottieRenderer>(getRenderer())->isPaused()) {
        return {};
      }

      setDrawingMode(RNSkDrawingMode::Default);
      std::static_pointer_cast<RNSkSkottieRenderer>(getRenderer())->pause();
    }

    return {};
  }
};
} // namespace RNSkia
