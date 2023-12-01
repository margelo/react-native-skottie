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
#include "JsiSkSkottie.h"
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
    }
  }

  void setProgress(double progress) {
    if (_animation == nullptr) {
        return;
    }

    _animation->getObject()->seek(progress);
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
        _animation->getObject()->render(canvas);
      }

      canvas->restore();
    });
    return true;
  }

  std::shared_ptr<RNSkPlatformContext> _platformContext;
  std::shared_ptr<JsiSkSkottie> _animation;
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
      }
      if (prop.first == "progress") {
        std::static_pointer_cast<RNSkSkottieRenderer>(getRenderer())->setProgress(prop.second.getAsNumber());
      }
    }
  }

  jsi::Value callJsiMethod(jsi::Runtime &runtime,
                                const std::string &name,
                                const jsi::Value *arguments, size_t count) override {
      if (name == "setProgress") {
          // Get first argument as number as it contains the updated value
          auto progressValue = arguments[0].asNumber();
          std::static_pointer_cast<RNSkSkottieRenderer>(getRenderer())->setProgress(progressValue);
          requestRedraw();
      }

      return {};
  }
};
} // namespace RNSkia
