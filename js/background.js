const NONE = "none", THEME_DIR = "theme/";
let checkAllTab = () => {
    chrome.tabs.query({}, tabs => {
        console.log(tabs);
        for (let tab of tabs) {
            Helper.injectLoadFile(tab);
        }
    })
};
let listen = () => {
    //listen reload tab
    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
        let key;
        switch (req.cmd) {
            case "load_tab":
                Helper.loadTab(sender.tab);
                break;
            case "get_key":
                key = Helper.getKey(req.url);
                if (!key) {
                    return sendResponse({cmd: "close"})
                }
                Helper.getTheme(key).then(theme => {
                    chrome.runtime.sendMessage({
                        cmd: "choose",
                        theme: theme
                    })
                });
                break;
            case  "change_theme":
                let tab = req.tab;
                key = Helper.getKey(tab.url);
                console.log("key : " + key);
                console.log("req.nameTheme : " + req.nameTheme);
                if (!key || !req.nameTheme) {
                    return;
                }
                Helper.saveTheme(tab.id, key, req.nameTheme);
                break;
            default:
                console.log(req.cmd + " is not has listener !!!")
        }
    });

    //listen when update or install
    //TODO this
};

class Helper {
    static sendStyle(id, fileName) {
        console.log(id);
        chrome.tabs.sendMessage(id, {
            cmd: "changed_theme",
            href: chrome.extension.getURL(fileName)
        });
    };

    static saveTheme(id, key, nameTheme) {
        let data = {};
        data[key] = nameTheme;
        chrome.storage.sync.set(data, () => {
            let fileName = Helper.getFileName(key, nameTheme);
            Helper.sendStyle(id, fileName);
            console.log("Saved theme of " + key + " is " + nameTheme)
        });
    };

    static getTheme(key) {
        return new Promise(resolve => {
            console.log(key);
            chrome.storage.sync.get(key, items => {
                if (items.hasOwnProperty(key)) {
                    resolve(items[key]);
                } else {
                    resolve(NONE)
                }
            })
        });
    };

    static getFileName(key, theme) {
        if (theme === NONE) {
            return THEME_DIR + "none.css";
        } else {
            return THEME_DIR + key + "-" + theme + ".css";
        }
    };

    static showPageAction(tab) {
        if (Helper.getKey(tab.url)) {
            chrome.pageAction.show(tab.id)
        }
    };

    static getKey(url) {
        for (let key in CONFIG.site) {
            console.log(key);
            console.log(CONFIG.site[key]);
            if (CONFIG.site.hasOwnProperty(key) && CONFIG.site[key].regexHost.test(Helper.getHostName(url))) {
                return key;
            }
        }
        return null;
    };

    static getHostName(url) {
        let mUrl = new URL(url);
        return mUrl.hostname;
    };

    static loadTab(tab) {
        Helper.showPageAction(tab);
        let key = Helper.getKey(tab.url);
        if (!key) {
            return;
        }
        Helper.getTheme(key).then(theme => {
            let fileName = Helper.getFileName(key, theme);
            Helper.sendStyle(tab.id, fileName);
        });
    };

    static injectLoadFile(tab) {
        chrome.tabs.executeScript(tab.id, {
            file: "js/load_tab.js",
            runAt: 'document_start',
            allFrames: false
        }, () => {
            this.loadTab(tab);
        });
    }
}
checkAllTab();
listen();