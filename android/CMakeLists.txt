cmake_minimum_required(VERSION 3.4.1)

set(PACKAGE_NAME "react-native-skia-skottie")

set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 17)

set(build_DIR ${CMAKE_SOURCE_DIR}/build)

if(${REACT_NATIVE_VERSION} GREATER_EQUAL 71)
  # Consume shared libraries and headers from prefabs
  find_package(fbjni REQUIRED CONFIG)
  find_package(ReactAndroid REQUIRED CONFIG)
endif()

add_library(${PACKAGE_NAME}
            SHARED
            ../cpp/react-native-skia-skottie.cpp
            cpp-adapter.cpp
)

# Specifies a path to native header files.
include_directories(
            ../cpp

            # include all rn-skia headers
            "${NODE_MODULES_DIR}/@shopify/react-native-skia/android/cpp/skia/include/config/"
            "${NODE_MODULES_DIR}/@shopify/react-native-skia/android/cpp/skia/include/core/"
            "${NODE_MODULES_DIR}/@shopify/react-native-skia/android/cpp/skia/include/effects/"
            "${NODE_MODULES_DIR}/@shopify/react-native-skia/android/cpp/skia/include/utils/"
            "${NODE_MODULES_DIR}/@shopify/react-native-skia/android/cpp/skia/include/pathops/"
            "${NODE_MODULES_DIR}/@shopify/react-native-skia/android/cpp/skia/modules/"
            "${NODE_MODULES_DIR}/@shopify/react-native-skia/android/cpp/skia/include/"
            "${NODE_MODULES_DIR}/@shopify/react-native-skia/android/cpp/skia/"

            "${NODE_MODULES_DIR}/@shopify/react-native-skia/android/cpp/api/"
            "${NODE_MODULES_DIR}/@shopify/react-native-skia/android/cpp/jsi/"
            "${NODE_MODULES_DIR}/@shopify/react-native-skia/android/cpp/jni/include/"
            "${NODE_MODULES_DIR}/@shopify/react-native-skia/android/cpp/rnskia-android/"
            "${NODE_MODULES_DIR}/@shopify/react-native-skia/android/cpp/rnskia/"
            "${NODE_MODULES_DIR}/@shopify/react-native-skia/android/cpp/rnskia/values/"
            "${NODE_MODULES_DIR}/@shopify/react-native-skia/android/cpp/utils/"
)

# Import prebuilt skia skottie library
set(SKIA_LIBS_PATH "${NODE_MODULES_DIR}/@shopify/react-native-skia/libs/android/${ANDROID_ABI}")
set(SKIA_MODULE_SKOTTIE_LIB "skottie")
add_library(skottie STATIC IMPORTED)
set_property(TARGET skottie PROPERTY IMPORTED_LOCATION "${SKIA_LIBS_PATH}/libskottie.a")

## Import react native JSI
# Then, import JSI
if(${REACT_NATIVE_VERSION} LESS 66)
  # JSI lib didn't exist on RN 0.65 and before. Simply omit it.
  set (JSI_LIB "")
elseif(${REACT_NATIVE_VERSION} GREATER_EQUAL 71)
  # RN 0.71 distributes prebuilt binaries.
  set (JSI_LIB ReactAndroid::jsi)
else()
  file(GLOB LIBRN_DIR "${PREBUILT_DIR}/${ANDROID_ABI}")
  # RN 0.66 distributes libjsi.so, can be used instead of compiling jsi.cpp manually.
  find_library(
          JSI_LIB
          jsi
          PATHS ${LIBRN_DIR}
          NO_CMAKE_FIND_ROOT_PATH
  )
endif()
message("-- JSI     : " ${JSI_LIB})

# Link
target_link_libraries(
        ${PACKAGE_NAME}
        ${JSI_LIB}
        ${SKIA_MODULE_SKOTTIE_LIB}
        android
)
