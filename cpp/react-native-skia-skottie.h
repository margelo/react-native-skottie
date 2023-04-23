#pragma once

#include <jsi/jsi.h>
#include <RNSkPlatformContext.h>

namespace RNSkia {
    using namespace facebook;

    class RNSkModuleManager {
    public:
        /**
         * Installs the javascript methods for registering/unregistering draw
         * callbacks for RNSkDrawViews. Called on installation of the parent native
         * module.
         */
        static void installBindings(
                jsi::Runtime *jsRuntime,
                std::shared_ptr<RNSkPlatformContext> platformContext
        );
    private:

        jsi::Runtime *_jsRuntime;
        std::shared_ptr<RNSkPlatformContext> _platformContext;
    };
}
