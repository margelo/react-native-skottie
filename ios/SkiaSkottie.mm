#import "SkiaSkottie.h"

#import <React/RCTBridge+Private.h>
#import <React/RCTUtils.h>
#import <ReactCommon/RCTTurboModule.h>
#import <jsi/jsi.h>

// Expect this function to be available:
std::string readDotLottie(std::string uri);

@implementation SkiaSkottie
RCT_EXPORT_MODULE() // TODO: include package name here?

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(install) {
  NSLog(@"Installing JSI bindings for react-native-skottie...");
  RCTBridge* bridge = [RCTBridge currentBridge];
  RCTCxxBridge* cxxBridge = (RCTCxxBridge*)bridge;
  if (cxxBridge == nil) {
    return @false;
  }

  using namespace facebook;

  auto jsiRuntime = (jsi::Runtime*)cxxBridge.runtime;
  if (jsiRuntime == nil) {
    return @false;
  }
  auto& runtime = *jsiRuntime;
  auto callInvoker = bridge.jsCallInvoker;

  // TODO: pass correct reference to RNSKPlatformContext
  // Note: I am wondering if for skottie we really need the platform context
  //       or could just do the JSI ourselves?
  RNSkia::RNSkModuleManager::installBindings(jsiRuntime, nullptr, readDotLottie);

  NSLog(@"Successfully installed JSI bindings for react-native-skottie!");
  return @true;
}

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams&)params {
  return std::make_shared<facebook::react::NativeSkiaSkottieSpecJSI>(params);
}
#endif

@end
