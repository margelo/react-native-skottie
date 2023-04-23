#ifdef __cplusplus
#import "react-native-skia-skottie.h"
#endif

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNSkiaSkottieSpec.h"

@interface SkiaSkottie : NSObject <NativeSkiaSkottieSpec>
#else
#import <React/RCTBridgeModule.h>

@interface SkiaSkottie : NSObject <RCTBridgeModule>
#endif

@end
