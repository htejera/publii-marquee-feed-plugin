class MarqueeFeedPlugin {
    constructor(API, name, config) {
        this.API = API;
        this.name = name;
        this.config = config;
    }

    addInsertions() {
        this.API.addInsertion('publiiHead', this.injectCSS.bind(this), 1, this);
        this.API.addInsertion('publiiHead', this.addMarqueeFeed.bind(this), 1, this);
    }

    injectCSS() {
        let animationSpeed = this.config.animationSpeed || '100';
        let backgroundColor = this.config.backgroundColor || 'black';
        let textSize = this.config.textSize || '14px';
        let textColor = this.config.textColor || 'white';
        let linkHoverColor = this.config.linkHoverColor || 'blue';
        let marqueeWidth = this.config.marqueeWidth || '100%';
        let borderColor = this.config.borderColor || 'white';
        let borderTop = this.config.borderTop || 'dashed';
        let borderBottom = this.config.borderBottom || 'dashed';

        return `
            <style>
                .marquee {
                    overflow: hidden;
                    position: relative;
                    background-color: ${backgroundColor};
                    z-index: 1000;
                    width: ${marqueeWidth};
                    border-top: ${borderColor} ${borderTop};       
                    border-bottom: ${borderColor} ${borderBottom};  
                  }
                  
                  .marquee::before {
                    content: '\u00A0';
                  }
                  
                  .scrolling {
                    animation: marquee ${animationSpeed}s linear infinite;
                    background-color: ${backgroundColor};
                    color: ${textColor};
                    font-size: ${textSize};
                    display: inline-block;
                    padding-right: 1px;
                    position: absolute;
                    left: 0;
                    top: 0;
                    white-space: nowrap;
                  }

                  .scrolling a{
                    color: ${textColor};
                  }

                  .scrolling a:hover{
                    color: ${linkHoverColor};
                  }

                  .scrolling:hover {
                    animation-play-state: paused;
                  }
                  
                  @keyframes marquee {
                    from {
                      transform: translateX(30%);
                    }
                    to { 
                      transform: translateX(-100%);
                    }
                  }                
            </style>
        `;
    }

    addMarqueeFeed(rendererInstance, context) {
        let feedUrl = this.config.feedUrl;
        let marqueeSeparator = this.config.marqueeSeparator || '|';
        let infoMessage = this.config.info || '';
        let showOnMobile = this.config.showOnMobile;
        let targetElementSelector = this.config.targetElementSelector || 'body';

        let scriptContent = `
        document.addEventListener("DOMContentLoaded", function() {
            function loadFeedXML(url) {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', url);
               
                xhr.onload = function() {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        let parser = new DOMParser();
                        let xmlDoc = parser.parseFromString(xhr.responseText, "application/xml");
                        let entries = xmlDoc.getElementsByTagName("entry");
                        let contenedor = document.createElement("div");
                        let scrolling = document.createElement('div');
                        let targetElement = document.querySelector(' ${targetElementSelector} ');
                        contenedor.className = "marquee";
                        scrolling.className = 'scrolling';
                        scrolling.setAttribute('aria-hidden', 'true');
                        let infoMessageContent = document.createTextNode('${infoMessage}' + " ");
                        scrolling.appendChild(infoMessageContent);
                        contenedor.appendChild(scrolling);
                            
                        Array.from(entries).forEach((entry, index, array) => {
                            let title = entry.getElementsByTagName("title")[0].textContent;
                            let link = entry.getElementsByTagName("link")[0].getAttribute("href");
        
                            let elementoA = document.createElement("a");
                            elementoA.setAttribute("href", link);
                            elementoA.textContent = title;
                            scrolling.appendChild(elementoA);
        
                            if (index < array.length - 1) {
                                scrolling.appendChild(document.createTextNode(' ${marqueeSeparator} '));
                            }
                        });  
                        
                        if (targetElement) {
                            targetElement.appendChild(contenedor);
                        } else {
                            document.body.insertBefore(contenedor, document.body.firstChild);
                        }
                        
                        if (!${showOnMobile} && window.innerWidth <= 768) {
                            if (contenedor) {
                                contenedor.style.display = 'none';
                            }
                        }
                         
                    } else {
                        console.error("Marquee feed plugin: Error loading the XML feed: ", xhr.statusText);
                    }
                };
        
                xhr.onerror = function() {
                    console.error("Marquee feed plugin: Network error while fetching the XML feed.");
                };
        
                xhr.send();
            }
        
            loadFeedXML('${feedUrl}');
        });
        
        `;

        return `<script type="text/javascript">${scriptContent}</script>`;
    }
}

module.exports = MarqueeFeedPlugin;
