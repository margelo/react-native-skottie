#include "react-native-skia-skottie.h"
#include "JsiSkSkottie.h"
#include <utility>

namespace RNSkia {
using namespace facebook;

void RNSkModuleManager::installBindings(jsi::Runtime* jsRuntime, std::shared_ptr<RNSkPlatformContext> platformContext) {
  // Install bindings
  auto createSkottie = JsiSkSkottie::createCtor(std::move(platformContext));
  jsRuntime->global().setProperty(
      *jsRuntime, "SkiaApi_SkottieCtor",
      jsi::Function::createFromHostFunction(*jsRuntime, jsi::PropNameID::forAscii(*jsRuntime, "SkottieCtor"), 1, createSkottie));
}
} // namespace RNSkia
