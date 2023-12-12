//
//  DotLottieReader.m
//  react-native-skia-skottie
//
//  Created by Hanno Gödecke on 11.12.23.
//

#import "DotLottieReader.h"
#import "SSZipArchive.h"
#import <Foundation/Foundation.h>

@implementation DotLottieReader

- (NSString*)readDotLottie:(NSString*)uri {

  NSLog(@"[react-native-skottie] Reading dotLottie file from %@ …", uri);
  NSData* data;
  // Check if the URI is a local file or a network resource
  if ([uri hasPrefix:@"http"]) {
    // Handle network resource
    NSURL* url = [NSURL URLWithString:uri];
    data = [NSData dataWithContentsOfURL:url];
  } else {
    // Handle local file
    NSURL* fileURL = [NSURL fileURLWithPath:uri];
    data = [NSData dataWithContentsOfURL:fileURL];
  }

  if (!data) {
    NSLog(@"[react-native-skottie] Reading dotLottie file failed, no data received!");
    @throw [NSException exceptionWithName:@"DotLottieReaderException" reason:@"Failed to read data for uri" userInfo:nil];
  }

  CFTimeInterval startTime = CACurrentMediaTime();
  NSLog(@"[react-native-skottie] Write dotLottie data to a temporary file…");
  // Write NSData to a temporary file
  NSString* tempZipPath = [NSTemporaryDirectory() stringByAppendingPathComponent:@"temp.zip"];
  [data writeToFile:tempZipPath atomically:YES];

  // Unzip the files
  NSLog(@"[react-native-skottie] Unzipping the file…");
  NSString* unzipDirectory = [NSTemporaryDirectory() stringByAppendingPathComponent:@"unzipped"];
  [SSZipArchive unzipFileAtPath:tempZipPath toDestination:unzipDirectory];
  [[NSFileManager defaultManager] removeItemAtPath:tempZipPath error:nil];

  NSLog(@"[react-native-skottie] Reading the animation data…");
  // Now we can access the files in 'unzipDirectory'
  // Get content of animations/data.json file
  NSString* filePath = [unzipDirectory stringByAppendingPathComponent:@"animations/data.json"];

  // Check if the file exists
  if (![[NSFileManager defaultManager] fileExistsAtPath:filePath]) {
    NSLog(@"[react-native-skottie] File does not exist: %@", filePath);
    @throw [NSException exceptionWithName:@"DotLottieReaderException"
                                   reason:@"animations/data.json not present in dotLottie file"
                                 userInfo:nil];
  }

  // Read the content of the file
  NSError* error = nil;
  NSData* fileData = [NSData dataWithContentsOfFile:filePath options:0 error:&error];

  if (error) {
    NSLog(@"[react-native-skottie] Error reading file: %@", error.localizedDescription);
    @throw [NSException exceptionWithName:@"DotLottieReaderException"
                                   reason:@"Animation data file was present, but there was an error reading it"
                                 userInfo:nil];
  }

  NSString* fileContent = [[NSString alloc] initWithData:fileData encoding:NSUTF8StringEncoding];
  if (!fileContent) {
    NSLog(@"[react-native-skottie] Error reading file (to string): %@", error.localizedDescription);
    @throw [NSException exceptionWithName:@"DotLottieReaderException"
                                   reason:@"Animation data file was present, but there was an error parsing it to atring"
                                 userInfo:nil];
  }

  [[NSFileManager defaultManager] removeItemAtPath:unzipDirectory error:nil];

  CFTimeInterval endTime = CACurrentMediaTime();
  CFTimeInterval elapsedTime = (endTime - startTime) * 1000.0;
  NSLog(@"[react-native-skottie] Reading dotLottie data took: %.3f milliseconds", elapsedTime);

  return fileContent;
}

@end
