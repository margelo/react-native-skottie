project(react-native-skottie)
cmake_minimum_required(VERSION 3.4.1)

set(PACKAGE_NAME "react-native-skottie")

set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 17)

set(build_DIR ${CMAKE_SOURCE_DIR}/build)

file(GLOB libfbjni_include_DIRS "${build_DIR}/fbjni-*-headers.jar/")

# We need to find packages since from RN 0.71 binaries are prebuilt
find_package(fbjni REQUIRED CONFIG)
find_package(ReactAndroid REQUIRED CONFIG)

add_library(${PACKAGE_NAME}
        SHARED
        ../cpp/react-native-skia-skottie.cpp
        ../cpp/JsiSkSkottie.h
        ../cpp/RNSkSkottieView.h
        ../cpp/RNSkTime.h
        ../cpp/RNSkTime.cpp
        cpp/jni/JniLoad.cpp
        cpp-adapter.cpp
)

# Specifies a path to native header files.
include_directories(
        ../cpp

        # Android specifics
        cpp/jni/include

        # React native
        "${NODE_MODULES_DIR}/react-native/ReactCommon/callinvoker"
        "${NODE_MODULES_DIR}/react-native/ReactCommon/jsi"
        "${NODE_MODULES_DIR}/react-native/ReactCommon"
        "${NODE_MODULES_DIR}/react-native/ReactCommon/react/nativemodule/core"
        "${NODE_MODULES_DIR}/react-native/ReactAndroid/src/main/java/com/facebook/react/turbomodule/core/jni"

        ${libfbjni_include_DIRS}
)

# Android Log lib
find_library(
        LOG_LIB
        log
)

# Link
target_link_libraries(
        ${PACKAGE_NAME}
        ${LOG_LIB}                          # <-- Logcat logger
        android                             # <-- Android JNI core
        fbjni::fbjni                        # <-- fbjni
        ReactAndroid::jsi                   # <-- RN: JSI
        -ljnigraphics
        -lGLESv2
        -lEGL
        -landroid
)

# This if-then-else can be removed once this library does not support version below 0.76
if(ReactAndroid_VERSION_MINOR GREATER_EQUAL 76)
    message("RN Filament: Using React Native merged SO...")
    target_link_libraries(
        ${PACKAGE_NAME}
        ReactAndroid::reactnative
    )
else()
    target_link_libraries(
        ${PACKAGE_NAME}
        ReactAndroid::react_nativemodule_core   # <-- RN: Native module core
        ReactAndroid::reactnativejni            # <-- RN: React Native JNI bindings
        ReactAndroid::runtimeexecutor           # <-- RN: Runtime executor
        ReactAndroid::turbomodulejsijni         # <-- RN: TurboModule JSI JNI bindings
    )
endif()

# 1. Link react-native-skia
message("react-native-skottie: Linking react-native-skia...")
find_package(shopify_react-native-skia REQUIRED CONFIG)
target_link_libraries(
        ${PACKAGE_NAME}
        shopify_react-native-skia::rnskia
)

# 2. Add react-native-skia to path so it itself can find it's relative imports
get_target_property(RN_SKIA_INCLUDE_DIR shopify_react-native-skia::rnskia INTERFACE_INCLUDE_DIRECTORIES)
message("react-native-skottie: react-native-skia include directory: ${RN_SKIA_INCLUDE_DIR}")
include_directories("${RN_SKIA_INCLUDE_DIR}/react-native-skia")

# 3. Link skia itself
set(RN_SKIA_DIR "${NODE_MODULES_DIR}/@shopify/react-native-skia")
message("react-native-skottie: react-native-skia directory: ${RN_SKIA_DIR}")
file(GLOB skiaLibraries "${RN_SKIA_DIR}/libs/android/${ANDROID_ABI}/*.a")
foreach(skiaLibrary ${skiaLibraries})
  message("react-native-skottie: Linking ${skiaLibrary}...")
  target_link_libraries(${PACKAGE_NAME} "${skiaLibrary}")
endforeach()

