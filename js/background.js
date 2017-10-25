const NONE = "none", THEME_DIR = "theme/";
let loadTab = tab=>{
    showPageAction(tab);
    let key = getPage(tab.url);
    if (!key) {
        return;
    }
    getTheme(key).then(theme => {
        let fileName = getFileName(key, theme);
        sendStyle(tab.id, fileName);
    });
};
let checkAllTab = ()=>{
    chrome.tabs.query({}, tabs=>{
        console.log(tabs);
        for (let tab of tabs){
            loadTab(tab);
        }
    })
};
let listen = () => {
    //listen reload tab
    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
        let key;
        switch (req.cmd) {
            case "load_tab":
                loadTab(sender.tab);
                break;
            case "get_key":
                key = getPage(req.url);
                if (!key) {
                    return sendResponse({cmd: "close"})
                }
                getTheme(key).then(theme => {
                    chrome.runtime.sendMessage({
                        cmd: "choose",
                        theme: theme
                    })
                });
                break;
            case  "change_theme":
                let tab = req.tab;
                key = getPage(tab.url);
                console.log("key : " + key);
                console.log("req.nameTheme : " + req.nameTheme);
                if (!key || !req.nameTheme) {
                    return;
                }
                saveTheme(tab.id, key, req.nameTheme);
                break;
            default:
                console.log(req.cmd + " is not has listener !!!")
        }
    });

    //listen when update or install
    //TODO this
};
let sendStyle = (id, fileName) => {
    console.log(id);
    chrome.tabs.sendMessage(id, {
        cmd: "changed_theme",
        href: chrome.extension.getURL(fileName)
    });
};
let saveTheme = (id, key, nameTheme) => {
    let data = {};
    data[key] = nameTheme;
    chrome.storage.sync.set(data, () => {
        let fileName = getFileName(key, nameTheme);
        sendStyle(id, fileName);
        console.log("Saved theme of " + key + " is " + nameTheme)
    });
};
let getTheme = (key) => {
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
let getFileName = (key, theme) => {
    if (theme === NONE) {
        return THEME_DIR + "none.css";
    } else {
        return THEME_DIR + key + "-" + theme + ".css";
    }
};
let showPageAction = (tab) => {
    if (getPage(tab.url)) {
        chrome.pageAction.show(tab.id)
    }
};
let getPage = (url) => {
    for (let page in CONFIG.site) {
        console.log(page);
        console.log(CONFIG.site[page]);
        if (CONFIG.site.hasOwnProperty(page) && CONFIG.site[page].regexHost.test(getHostName(url))) {
            return page;
        }
    }
    return false;
};

let getHostName = (url) => {
    let mUrl = new URL(url);
    return mUrl.hostname;
};
checkAllTab();
listen();