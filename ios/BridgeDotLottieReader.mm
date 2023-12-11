//
//  BridgeDotLottieReader.m
//  react-native-skia-skottie
//
//  Created by Hanno Gödecke on 11.12.23.
//

#import "DotLottieReader.h"
#import <Foundation/Foundation.h>
#include <string>

std::string readDotLottie(std::string uri) {
  NSString* uriNS = [NSString stringWithUTF8String:uri.c_str()];

  DotLottieReader* reader = [[DotLottieReader alloc] init];
  NSString* result = [reader readDotLottie:uriNS];
  std::string resultStr = [result UTF8String];
  return resultStr;
}
