let tab, listFrame, chooser;
let initTab = () => {
    chrome.tabs.query({
        'active': true,
        'lastFocusedWindow': true
    }, function (tabs) {
        tab = tabs[0];
        chrome.runtime.sendMessage({
            cmd: "get_key",
            url: tab.url
        }, res => {
            if (res && res.cmd === "close") {
                close();
            }
        });
    });
};
let listen = () => {
    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
        switch (req.cmd) {
            case "load_tab":
                if (sender.tab.id === tab.id) {
                    close();
                }
                break;
            case "choose":
                let elem = document.getElementsByClassName(req.theme)[0];
                let key = req.key;
                document.getElementById("key").innerHTML=req.key;
                chooser.addClass(elem);
                break;
        }
    });
};

let changeTheme = (tab, nameTheme) => {
    chrome.runtime.sendMessage({
        cmd: "change_theme",
        tab: tab,
        nameTheme: nameTheme
    });
};
let addClickListener = (classFrame) => {
    listFrame = document.getElementsByClassName(classFrame);
    chooser = new Chooser("active");
    for (let elem of listFrame) {
        elem.onclick = function () {
            chooser.addClass(elem);
            changeTheme(tab, elem.getAttribute("data-theme"));
        };

    }
};

class Chooser {
    constructor(cls) {
        this.cls = cls;
    }

    addClass(elem) {
        this.removeClass(this.lastElem);
        this.lastElem = elem;
        let listClass = elem.className.split(" ");
        if (listClass.indexOf(this.cls) === -1) {
            listClass.push(this.cls);
            elem.className = listClass.join(" ")
        }
    }

    removeClass(elem) {
        if (!elem) return;
        let listClass = elem.className.split(" ");
        let index = listClass.indexOf(this.cls);
        while (index >= 0) {
            listClass.splice(index, 1);
            index = listClass.indexOf(this.cls);
        }
        elem.className = listClass.join(" ")
    }
}

initTab();
addClickListener('frame_theme');
listen();