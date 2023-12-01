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
#include "RNSkTimingInfo.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkBBHFactory.h"
#include "SkCanvas.h"
#include "SkPictureRecorder.h"
#include <modules/skottie/include/Skottie.h>

#pragma clang diagnostic pop

class SkRect;

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

  void setSrc(std::string src) {
    _animation = skottie::Animation::Builder().make(src.c_str(), src.size());
  }

  void setProgress(double progress) {
    if (_animation != nullptr) {
      _animation.get()->seek(progress);
    } else {
      _initialProgress = progress;
    }
  }

private:
  bool performDraw(std::shared_ptr<RNSkCanvasProvider> canvasProvider) {
    canvasProvider->renderToCanvas([=](SkCanvas* canvas) {
      // Make sure to scale correctly
      auto pd = _platformContext->getPixelDensity();
      canvas->clear(SK_ColorTRANSPARENT);
      canvas->save();
      canvas->scale(pd, pd);

      // TODO:  Question Christian: performDraw will get called when the animation value updates
      //        because we are using registerValues. So there is no de-sync between render and seek, right?
      // However, the animation value might update more frequently than 60FPS?
      // Do we need to limit this somehow to avoid over computation?
      if (_animation != nullptr) {
        _animation.get()->render(canvas);
      }

      canvas->restore();
    });
    return true;
  }

  std::shared_ptr<RNSkPlatformContext> _platformContext;
  sk_sp<skottie::Animation> _animation;
  double _initialProgress = std::nan("");
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
      if (prop.first == "src" && prop.second.getType() == RNJsi::JsiWrapperValueType::String) {
        std::static_pointer_cast<RNSkSkottieRenderer>(getRenderer())->setSrc(prop.second.getAsString());
      }
      if (prop.first == "progress") {
        std::static_pointer_cast<RNSkSkottieRenderer>(getRenderer())->setProgress(prop.second.getAsNumber());
      }
    }
  }
};
} // namespace RNSkia
