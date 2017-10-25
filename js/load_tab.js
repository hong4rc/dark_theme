let link;
let addTag = () => {
    let html = document.getElementsByTagName('html')[0];
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    html.appendChild(link);
};
let listen = () => {
    chrome.runtime.onMessage.addListener((req) => {
        console.log(req);
        if (req.cmd && req.cmd === "changed_theme") {
            let href = req.href;
            if (href) {
                link.href = req.href;
            }
        }
    });
};

addTag();
listen();
chrome.runtime.sendMessage({cmd: "load_tab"}, res =>{
    console.log(res);
});