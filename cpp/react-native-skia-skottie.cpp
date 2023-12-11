#include "react-native-skia-skottie.h"
#include "JsiSkSkottie.h"
#include <utility>

// Expect this function to be available:
std::string readDotLottie(std::string uri);

namespace RNSkia {
using namespace facebook;

void RNSkModuleManager::installBindings(jsi::Runtime* jsRuntime, std::shared_ptr<RNSkPlatformContext> platformContext) {
  // Install bindings
  auto createSkottie = JsiSkSkottie::createCtor(std::move(platformContext));
  jsRuntime->global().setProperty(
      *jsRuntime, "SkiaApi_SkottieCtor",
      jsi::Function::createFromHostFunction(*jsRuntime, jsi::PropNameID::forAscii(*jsRuntime, "SkottieCtor"), 1, createSkottie));

  jsRuntime->global().setProperty(
      *jsRuntime, "SkiaApi_SkottieFromUri",
      jsi::Function::createFromHostFunction(
          *jsRuntime, jsi::PropNameID::forAscii(*jsRuntime, "SkottieFromUri"), 1,
          [](jsi::Runtime& rt, const jsi::Value& thisValue, const jsi::Value* args, size_t count) -> jsi::Value // C++ lambda
          {
            if (count == 0) {
              jsi::detail::throwOrDie<jsi::JSError>(
                  rt, "[react-native-skottie] Need to pass a string as first argument which is a path to the asset!");
              return {};
            }

            if (!args[0].isString()) {
              jsi::detail::throwOrDie<jsi::JSError>(rt, "[react-native-skottie] database name must be a string");
              return {};
            }

            std::string dotLottieFilePath = args[0].asString(rt).utf8(rt);
            std::string result = readDotLottie(dotLottieFilePath);

            return {};
          }));
}
} // namespace RNSkia
