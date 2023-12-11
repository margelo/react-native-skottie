project(react-native-skottie)
cmake_minimum_required(VERSION 3.4.1)

set(PACKAGE_NAME "react-native-skottie")

set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 17)

set(build_DIR ${CMAKE_SOURCE_DIR}/build)

file(GLOB libfbjni_include_DIRS "${build_DIR}/fbjni-*-headers.jar/")

# Consume shared libraries and headers from prefabs
find_package(fbjni REQUIRED CONFIG)
find_package(ReactAndroid REQUIRED CONFIG)
find_package(shopify_react-native-skia REQUIRED CONFIG)

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

        # include skia headers
        "${NODE_MODULES_DIR}/@shopify/react-native-skia/cpp/rnskia"
        "${NODE_MODULES_DIR}/@shopify/react-native-skia/cpp/skia/include/config/"
        "${NODE_MODULES_DIR}/@shopify/react-native-skia/cpp/skia/include/core/"
        "${NODE_MODULES_DIR}/@shopify/react-native-skia/cpp/skia/include/effects/"
        "${NODE_MODULES_DIR}/@shopify/react-native-skia/cpp/skia/include/utils/"
        "${NODE_MODULES_DIR}/@shopify/react-native-skia/cpp/skia/include/pathops/"
        "${NODE_MODULES_DIR}/@shopify/react-native-skia/cpp/skia/modules/"
        "${NODE_MODULES_DIR}/@shopify/react-native-skia/cpp/skia/modules/skparagraph/include/"
        "${NODE_MODULES_DIR}/@shopify/react-native-skia/cpp/skia/include/"
        "${NODE_MODULES_DIR}/@shopify/react-native-skia/cpp/skia"

        "${NODE_MODULES_DIR}/@shopify/react-native-skia/cpp/api"
        "${NODE_MODULES_DIR}/@shopify/react-native-skia/cpp/jsi"
        "${NODE_MODULES_DIR}/@shopify/react-native-skia/cpp/rnskia"
        "${NODE_MODULES_DIR}/@shopify/react-native-skia/cpp/rnskia/values"
        "${NODE_MODULES_DIR}/@shopify/react-native-skia/cpp/rnskia/dom"
        "${NODE_MODULES_DIR}/@shopify/react-native-skia/cpp/rnskia/dom/base"
        "${NODE_MODULES_DIR}/@shopify/react-native-skia/cpp/rnskia/dom/nodes"
        "${NODE_MODULES_DIR}/@shopify/react-native-skia/cpp/rnskia/dom/props"
        "${NODE_MODULES_DIR}/@shopify/react-native-skia/cpp/utils"

        ${libfbjni_include_DIRS}
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

set(SKIA_MODULE_SKUNICODE_LIB "skunicode")
add_library(skunicode STATIC IMPORTED)
set_property(TARGET skunicode PROPERTY IMPORTED_LOCATION "${SKIA_LIBS_PATH}/libskunicode.a")

# Import react native libs
find_package(fbjni REQUIRED CONFIG)
find_package(ReactAndroid REQUIRED CONFIG)
set(JSI_LIB ReactAndroid::jsi)
message("-- JSI     : " ${JSI_LIB})
set(FBJNI_LIBRARY fbjni::fbjni)
message("-- FBJNI   : " ${FBJNI_LIBRARY})
set(REACT_LIB ReactAndroid::react_nativemodule_core)
message("-- REACT   : " ${REACT_LIB})
set(TURBOMODULES_LIB "ReactAndroid::turbomodulejsijni")
message("-- TURBO   : " ${TURBOMODULES_LIB})

# Log lib
find_library(
        LOG_LIB
        log
)

# Link
target_link_libraries(
        ${PACKAGE_NAME}
        ${LOG_LIB}
        ${FBJNI_LIBRARY}
        ${REACT_LIB}
        ${JSI_LIB}
        ${TURBOMODULES_LIB}
        ${SKIA_MODULE_SKOTTIE_LIB}
        ${SKIA_SKSHAPER_LIB}
        ${SKIA_MODULE_SKSG_LIB}
        ${SKIA_MODULE_SKUNICODE_LIB}
        ${SKIA_LIB}
        shopify_react-native-skia::rnskia
        -ljnigraphics
        -lGLESv2
        -lEGL
        -landroid
)
