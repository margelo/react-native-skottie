#include "react-native-skia-skottie.h"
#include "JsiSkSkottie.h"
#include <utility>

// Expect this function to be available:
//std::string readDotLottie(std::string uri);

namespace RNSkia {
using namespace facebook;

std::function<std::string(std::string)> _readDotLottieArg;
void RNSkModuleManager::installBindings(jsi::Runtime* jsRuntime, std::shared_ptr<RNSkPlatformContext> platformContext, std::function<std::string(std::string)> readDotLottieArg) {
  // Install bindings
  auto createSkottie = JsiSkSkottie::createCtor(std::move(platformContext));
  jsRuntime->global().setProperty(
      *jsRuntime, "SkiaApi_SkottieCtor",
      jsi::Function::createFromHostFunction(*jsRuntime, jsi::PropNameID::forAscii(*jsRuntime, "SkottieCtor"), 1, createSkottie));

  _readDotLottieArg = readDotLottieArg;
  jsRuntime->global().setProperty(
      *jsRuntime, "SkiaApi_SkottieFromUri",
      jsi::Function::createFromHostFunction(
          *jsRuntime, jsi::PropNameID::forAscii(*jsRuntime, "SkottieFromUri"), 1,
          [createSkottie](jsi::Runtime& rt, const jsi::Value& thisValue, const jsi::Value* args, size_t count) -> jsi::Value // C++ lambda
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

            try {
                std::string dotLottieFilePath = args[0].asString(rt).utf8(rt);
                std::string result = _readDotLottieArg(dotLottieFilePath);

                // Make SkSkottie instance from string
                jsi::Value animString = jsi::String::createFromUtf8(rt, result);
                std::vector<jsi::Value> arguments;
                arguments.emplace_back(std::move(animString));
                return createSkottie(rt, thisValue, arguments.data(), arguments.size());
            } catch (const std::exception& e) {
                jsi::detail::throwOrDie<jsi::JSError>(rt, e.what());
            }

            return {};
          }));
}
} // namespace RNSkia
