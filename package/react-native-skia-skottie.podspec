require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

nodeModules = Dir.exist?(File.join(__dir__, "node_modules")) ? File.join(__dir__, "node_modules") : File.join(__dir__, "..")
skiaPath = File.join(nodeModules, "@shopify", "react-native-skia")

folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name         = "react-native-skia-skottie"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "12.4" }
  s.source       = { :git => "https://github.com/margelo/react-native-skia-skottie.git", :tag => "#{s.version}" }

  # TODO: what does that do, why do we need it?
  s.requires_arc = true

  s.pod_target_xcconfig = {
    "GCC_PREPROCESSOR_DEFINITIONS" => "$(inherited) SK_METAL=1 SK_GANESH=1", # TODO: do i need this?
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++17",
    "HEADER_SEARCH_PATHS" => "\"$(PODS_TARGET_SRCROOT)/cpp/\"/** \"#{skiaPath}/cpp/**\" "
  }

  pwd = Pathname.new(Dir.pwd)
  relative_skia_path = Pathname.new(skiaPath).relative_path_from(pwd).to_s
  s.ios.vendored_frameworks = [
    "#{relative_skia_path}/libs/ios/libsksg.xcframework",
    "#{relative_skia_path}/libs/ios/libskottie.xcframework",
  ]

  s.source_files = "ios/**/*.{h,m,mm}", "cpp/**/*.{h,cpp}"

  s.dependency "React"
  s.dependency "React-Core"
  s.dependency "react-native-skia"
  s.dependency "SSZipArchive"

  # # Don't install the dependencies when we run `pod install` in the old architecture.
  # if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
  #   s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
  #   s.pod_target_xcconfig    = {
  #       "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
  #       "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
  #       "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
  #   }
  #   s.dependency "React-Codegen"
  #   s.dependency "RCT-Folly"
  #   s.dependency "RCTRequired"
  #   s.dependency "RCTTypeSafety"
  #   s.dependency "ReactCommon/turbomodule/core"
  # end
end
