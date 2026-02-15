const { withXcodeProject, withDangerousMod, withEntitlementsPlist } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const WIDGET_TARGET_NAME = 'IslamvyWidget';
const WIDGET_BUNDLE_ID = 'com.esat.islamvy.IslamvyWidget'; // Must be consistent
const APP_GROUP_ID = 'group.com.esat.islamvy';

const withWidgetError = (config, error) => {
    console.log("Widget Plugin Error: ", error);
    return config;
};

const withWidgetXcodeTarget = (config) => {
    return withXcodeProject(config, async (config) => {
        try {
            const project = config.modResults;
            const target = project.addTarget(WIDGET_TARGET_NAME, 'app_extension', WIDGET_TARGET_NAME);

            const group = project.addPbxGroup(
                [
                    'IslamvyWidget.swift',
                    'IslamvyWidgetBundle.swift',
                    'Info.plist',
                    'Assets.xcassets'
                ],
                WIDGET_TARGET_NAME,
                WIDGET_TARGET_NAME
            );

            // Add Build Phases
            project.addBuildPhase(
                ['IslamvyWidget.swift', 'IslamvyWidgetBundle.swift'],
                'PBXSourcesBuildPhase',
                'Sources',
                target.uuid
            );

            project.addBuildPhase(
                [],
                'PBXResourcesBuildPhase',
                'Resources',
                target.uuid
            );

            // Add Build Configuration
            const configurations = project.pbxXCBuildConfigurationSection();
            for (const key in configurations) {
                if (typeof configurations[key].buildSettings !== 'undefined') {
                    const buildSettings = configurations[key].buildSettings;
                    if (buildSettings.PRODUCT_NAME === `"${WIDGET_TARGET_NAME}"`) {
                        buildSettings.INFOPLIST_FILE = `${WIDGET_TARGET_NAME}/Info.plist`;
                        buildSettings.PRODUCT_BUNDLE_IDENTIFIER = WIDGET_BUNDLE_ID;
                        buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '16.0';
                        buildSettings.TARGETED_DEVICE_FAMILY = '"1"'; // iPhone
                        buildSettings.SWIFT_VERSION = '5.0';
                        buildSettings.DEVELOPMENT_TEAM = '2636bcd5-49b8-4f8d-a35a-0f67d3a4fdad'; // From project
                        buildSettings.CODE_SIGN_ENTITLEMENTS = `${WIDGET_TARGET_NAME}/${WIDGET_TARGET_NAME}.entitlements`;
                    }
                }
            }

            // Copy files to ios/IslamvyWidget
            const widgetSourceDir = path.join(config.modRequest.projectRoot, 'ios-widget');
            const widgetDestDir = path.join(config.modRequest.platformProjectRoot, WIDGET_TARGET_NAME);

            if (!fs.existsSync(widgetDestDir)) {
                fs.mkdirSync(widgetDestDir);
            }

            // Copy standard files
            ['IslamvyWidget.swift', 'IslamvyWidgetBundle.swift', 'Info.plist', 'IslamvyWidget.entitlements'].forEach(file => {
                fs.copyFileSync(
                    path.join(widgetSourceDir, file),
                    path.join(widgetDestDir, file)
                );
            });

            // Create Assets.xcassets if not exists (simplified)
            const assetsDir = path.join(widgetDestDir, 'Assets.xcassets');
            if (!fs.existsSync(assetsDir)) {
                fs.mkdirSync(assetsDir);
                // Create dummy contents.json
                fs.writeFileSync(path.join(assetsDir, 'Contents.json'), JSON.stringify({ info: { version: 1, author: "xcode" }, data: [] }));
            }

        } catch (e) {
            console.error(e);
        }
        return config;
    });
};

const withWidgetEntitlements = (config) => {
    return withEntitlementsPlist(config, (config) => {
        config.modResults['com.apple.security.application-groups'] = [APP_GROUP_ID];
        return config;
    });
};

const withWidget = (config) => {
    config = withWidgetXcodeTarget(config);
    config = withWidgetEntitlements(config);
    return config;
};

module.exports = withWidget;
