#pragma once

#include <cmath>
#include <functional>
#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>
#include <vector>

#include <jsi/jsi.h>

#include "JsiSkPicture.h"
#include "JsiValueWrapper.h"
#include "RNSkInfoParameter.h"
#include "RNSkLog.h"
#include "RNSkPlatformContext.h"
#include "RNSkView.h"

#include "JsiSkSkottie.h"
#include "RNSkTime.h"
#include "RNSkTimingInfo.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <algorithm>
#include <include/core/SkBBHFactory.h>
#include <include/core/SkCanvas.h>
#include <include/core/SkPictureRecorder.h>
#include <modules/skottie/include/Skottie.h>
#include <vector>

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
    return _lastPauseTime > 0.0 || _startTime == -1.0;
  }

  void pause() {
    if (isPaused()) {
      // We are already paused
      return;
    }

    _lastPauseTime = RNSkTime::GetSecs();
  }

  void resetPlayback() {
    _startTime = -1.0;
    _lastPauseTime = 0.0;
    _totalPausedDuration = 0.0;
    _animation->getObject()->seekFrame(0);
  }

  void setOnFinishAnimation(std::function<void()> onFinishAnimation) {
    _onFinishAnimation = onFinishAnimation;
  }
    
    bool isAnimationFinished() {
        return _timePassed == 0.0;
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
      _timePassed = timeNow - _startTime - _totalPausedDuration;
      auto duration = _animation->getObject()->duration();
      if (_timePassed > duration) {
        setStartTime(timeNow);
        _timePassed = 0.0;

        // Reset paused values for cleanup
        _lastPauseTime = 0.0;
        _totalPausedDuration = 0.0;

        if (_onFinishAnimation != nullptr) {
          _onFinishAnimation();
        }
      }

      _animation->getObject()->seekFrameTime(_timePassed);
    }

    return true;
  }

  std::shared_ptr<RNSkPlatformContext> _platformContext;
  std::shared_ptr<JsiSkSkottie> _animation;
  std::function<void()> _onFinishAnimation;
  SkRect _srcR;
  std::string _resizeMode = "contain";
  double _startTime = -1.0;
  double _lastPauseTime = 0.0;
  double _totalPausedDuration = 0.0;
    // The amount of time the animation has played so far.
    double _timePassed = 0.0;
};

class RNSkSkottieView : public RNSkView {
private:
  std::shared_ptr<jsi::Function> onAnimationFinishPtr = nullptr;
  bool isLooping = true;

  std::shared_ptr<RNSkSkottieView> shared() {
    return std::dynamic_pointer_cast<RNSkSkottieView>(RNSkView::shared_from_this());
  }

public:
  /**
   * Constructor
   */
  RNSkSkottieView(std::shared_ptr<RNSkPlatformContext> context, std::shared_ptr<RNSkCanvasProvider> canvasProvider)
      : RNSkView(context, canvasProvider,
                 std::make_shared<RNSkSkottieRenderer>(std::bind(&RNSkSkottieView::requestRedraw, this), context)) {

    // Set the onFinish callback
    std::static_pointer_cast<RNSkSkottieRenderer>(getRenderer())->setOnFinishAnimation([this]() {
      if (onAnimationFinishPtr != nullptr) {
        auto runtime = getPlatformContext()->getJsRuntime();
        onAnimationFinishPtr->call(*runtime, jsi::Value(false));
      }

      if (!isLooping) {
        resetAnimation();
      }
    });
  }

  void resetAnimation() {
    std::static_pointer_cast<RNSkSkottieRenderer>(getRenderer())->resetPlayback();
    setDrawingMode(RNSkDrawingMode::Default);
  }

  ~RNSkSkottieView() {
    std::shared_ptr<RNSkPlatformContext> platformContext = getPlatformContext();
    auto jsRuntime = platformContext->getJsRuntime();
    // Call the onAnimationFinish callback
    if (getRenderer() == nullptr || jsRuntime == nullptr || onAnimationFinishPtr == nullptr) {
      return;
    }
      
      std::shared_ptr<RNSkSkottieRenderer> renderer = std::static_pointer_cast<RNSkSkottieRenderer>(getRenderer());
      if (renderer->isAnimationFinished()) {
          return;
      }

      // The animation wasn't finished, notify that it got cancelled:
    if (platformContext->isOnJavascriptThread()) {
      onAnimationFinishPtr->call(*jsRuntime, jsi::Value(true));
    } else {
      std::shared_ptr<jsi::Function> onAnimationFinish = onAnimationFinishPtr;
      platformContext->runOnJavascriptThread([=]() { onAnimationFinish->call(*jsRuntime, jsi::Value(true)); });
    }
  }

  void setJsiProperties(std::unordered_map<std::string, RNJsi::JsiValueWrapper>& props) override {

    RNSkView::setJsiProperties(props);

    // We need to make sure .start gets called last.
    // It might happen that setJsiProperties gets called multiple times before the view is actually ready.
    // In this case all our "props" will be stored, and then once its ready setJsiProperties gets called
    // with all the props at once. Then .start has to be called last, otherwise the animation will not play.
    std::vector<std::pair<std::string, RNJsi::JsiValueWrapper>> sortedProps(props.begin(), props.end());
    if (sortedProps.size() > 1) {
      // Custom sort function to place 'start' at the end
      std::sort(sortedProps.begin(), sortedProps.end(),
                [](const auto& a, const auto& b) { return !(a.first == "start") && (b.first == "start" || a.first < b.first); });
    }

      std::shared_ptr<RNSkSkottieRenderer> renderer = std::static_pointer_cast<RNSkSkottieRenderer>(getRenderer());
    for (auto& prop : sortedProps) {
      if (prop.first == "src" && prop.second.getType() == RNJsi::JsiWrapperValueType::HostObject) {
          renderer->setSrc(prop.second.getAsHostObject());
        renderImmediate(); // Draw the first frame
      } else if (prop.first == "scaleType") {
          renderer->setResizeMode(prop.second.getAsString());
      } else if (prop.first == "setProgress") {
        // Get first argument as number as it contains the updated value
        auto progressValue = prop.second.getAsNumber();
          renderer->setProgress(progressValue);
        requestRedraw();
      } else if (prop.first == "start") {
        // The prop.second can be an object with a onAnimationFinish function
        auto options = prop.second.getAsObject();
        std::shared_ptr<RNSkPlatformContext> platformContext = getPlatformContext();

        if (platformContext == nullptr) {
          throw new std::runtime_error("Platform context is null");
        }

        // Create a lambda that sets the onAnimationFinish callback
        std::weak_ptr<RNSkSkottieView> weakSelf = shared();
        auto installOnAnimationFinishCallback = [=]() {
          std::shared_ptr<RNSkSkottieView> strongSelf = weakSelf.lock();
          if (!strongSelf) {
            RNSkLogger::logToConsole(
                "Failed to obtain strongSelf in installOnAnimationFinishCallback. Can't install onAnimationFinish callback.");
            return;
          }

          auto runtime = platformContext->getJsRuntime();
          auto function = options->getProperty(*runtime, "onAnimationFinish");
          if (!function.isUndefined()) {
            auto onAnimationFinish = options->getPropertyAsFunction(*runtime, "onAnimationFinish");
            // Use a shared pointer to manage the lifecycle of the JSI function
            strongSelf->onAnimationFinishPtr = std::make_shared<jsi::Function>(std::move(onAnimationFinish));
          } else {
            strongSelf->onAnimationFinishPtr = nullptr;
          }
        };

        // We can only call the runtime on the JS thread.
        // And we might be called from the UI thread here.
        if (platformContext->isOnJavascriptThread()) {
          installOnAnimationFinishCallback();
        } else {
          // TODO: note, this is async and potentially requires us to use a lock
          //       or we find a way to call the _callInvoker sync
          platformContext->runOnJavascriptThread(installOnAnimationFinishCallback);
        }
          
          // Actually start the rendering:
          renderer->setStartTime(RNSkTime::GetSecs());
          setDrawingMode(RNSkDrawingMode::Continuous);
      } else if (prop.first == "pause") {
          if (renderer->isPaused()) {
          continue;
        }

        setDrawingMode(RNSkDrawingMode::Default);
          renderer->pause();
      } else if (prop.first == "reset") {
          renderer->resetPlayback();
        setDrawingMode(RNSkDrawingMode::Default); // This will also trigger a requestRedraw
      } else if (prop.first == "loop") {
        isLooping = prop.second.getAsBool();
      }
    }
  }
};
} // namespace RNSkia
