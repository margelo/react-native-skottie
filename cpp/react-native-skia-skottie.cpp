#include <utility>
#include "JsiSkSkottie.h"
#include "react-native-skia-skottie.h"

namespace RNSkia {
    using namespace facebook;

    void RNSkModuleManager::installBindings(
            jsi::Runtime *jsRuntime,
            std::shared_ptr<RNSkPlatformContext> platformContext
    ) {
        // Install bindings
        auto createSkottie = JsiSkSkottie::createCtor(std::move(platformContext));
        // TODO: fix me - what to fix here?
        jsRuntime->global().setProperty(
                *jsRuntime, "SkiaApi_SkottieCtor",
                jsi::Function::createFromHostFunction(
                        *jsRuntime,
                        jsi::PropNameID::forAscii(*jsRuntime, "SkottieCtor"),
                        1,
                        createSkottie
                )
        );
    }
}
