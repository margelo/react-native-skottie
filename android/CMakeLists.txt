project(react-native-skia-skottie)
cmake_minimum_required(VERSION 3.4.1)

set(PACKAGE_NAME "react-native-skia-skottie")

set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 17)

set(build_DIR ${CMAKE_SOURCE_DIR}/build)
# Consume shared libraries and headers from prefabs
find_package(fbjni REQUIRED CONFIG)
find_package(ReactAndroid REQUIRED CONFIG)
find_package(shopify_react-native-skia REQUIRED CONFIG)

add_library(${PACKAGE_NAME}
            SHARED
            ../cpp/react-native-skia-skottie.cpp
            ../cpp/JsiSkSkottie.h
            cpp-adapter.cpp
)

# Specifies a path to native header files.
include_directories(
            ../cpp

            # React native
            "${NODE_MODULES_DIR}/react-native/ReactCommon/callinvoker"
            "${NODE_MODULES_DIR}/react-native/ReactCommon/jsi"
            "${NODE_MODULES_DIR}/react-native/ReactCommon"
            "${NODE_MODULES_DIR}/react-native/ReactCommon/react/nativemodule/core"
            "${NODE_MODULES_DIR}/react-native/ReactAndroid/src/main/java/com/facebook/react/turbomodule/core/jni"

            # include skia headers
            "${NODE_MODULES_DIR}/@shopify/react-native-skia/cpp/skia"
)

# Import prebuilt skia skottie library
set(SKIA_LIBS_PATH "${NODE_MODULES_DIR}/@shopify/react-native-skia/libs/android/${ANDROID_ABI}")

set(SKIA_LIB "skia")
add_library(skia STATIC IMPORTED)
set_property(TARGET skia PROPERTY IMPORTED_LOCATION "${SKIA_LIBS_PATH}/libskia.a")

set(SKIA_MODULE_SKOTTIE_LIB "skottie")
add_library(skottie STATIC IMPORTED)
set_property(TARGET skottie PROPERTY IMPORTED_LOCATION "${SKIA_LIBS_PATH}/libskottie.a")

set(SKIA_SKSHAPER_LIB "skshaper")
add_library(skshaper STATIC IMPORTED)
set_property(TARGET skshaper PROPERTY IMPORTED_LOCATION "${SKIA_LIBS_PATH}/libskshaper.a")

set(SKIA_MODULE_SKSG_LIB "sksg")
add_library(sksg STATIC IMPORTED)
set_property(TARGET sksg PROPERTY IMPORTED_LOCATION "${SKIA_LIBS_PATH}/libsksg.a")

## Import react native JSI
set (JSI_LIB ReactAndroid::jsi)
message("-- JSI     : " ${JSI_LIB})

# Log lib
find_library(
        LOG_LIB
        log
)

# Link
target_link_libraries(
        ${PACKAGE_NAME}
        ${LOG_LIB}
        ${JSI_LIB}
        ${SKIA_MODULE_SKOTTIE_LIB}
        ${SKIA_SKSHAPER_LIB}
        ${SKIA_MODULE_SKSG_LIB}
        ${SKIA_LIB}
        shopify_react-native-skia::rnskia
        -ljnigraphics
        -lGLESv2
        -lEGL
        -landroid
)
