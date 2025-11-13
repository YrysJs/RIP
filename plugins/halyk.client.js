export default defineNuxtPlugin(() => {
    if (process.server) return

    // Проверяем, чтобы не подключать дважды
    if (window.halyk) return

        // Вставляем код в глобальную область
        ;(function (halyk: any) {
        const isTest = false
        const testConfig = {
            pageUrL: "https://test-epay.homebank.kz/payform/",
            origin: "https://test-epay.homebank.kz",
            TokenAPIConfig: {
                url: "https://testoauth.homebank.kz/epay2/oauth2/token",
                clientId: "test"
            }
        }
        const prodConfig = {
            pageUrL: "https://epay.homebank.kz/payform/",
            origin: "https://epay.homebank.kz",
            TokenAPIConfig: {
                url: "https://epay-oauth.homebank.kz/oauth2/token",
                clientId: "uberflower"
            }
        }

        halyk.Config = function Config() {
            return isTest ? testConfig : prodConfig
        }

        const pageUrl = halyk.Config().pageUrL
        const paymentPageOrigin = halyk.Config().origin

        function encodeParams(params: any) {
            if (params == null) return ""
            if (typeof params !== "object") return String(params)
            return Object.entries(params)
                .map(([key, val]) => `${key}=${encodeURIComponent(encodeParams(val))}`)
                .join("&")
        }

        function addCssClass() {
            const style = document.createElement("style")
            style.type = "text/css"
            style.innerHTML = `
        .widgetScreen {position: fixed; top: 0; bottom: 0; left: 0; right: 0;
          z-index: 1000; background-color: rgba(5,5,5,0.5); display: flex;
          justify-content: center; align-items: center;}
        .iframeBox {border-radius: 4px; position: relative; width: 400px;
          z-index: 1010; background-color: #fff; overflow: hidden;}
        .iframeClass {width: 100%; height: 90vh; border: none;}
      `
            document.head.appendChild(style)
        }

        let paymentWidgedCallBack: any
        let widgetNode: HTMLElement | undefined

        function onCloseDialog(result: boolean) {
            paymentWidgedCallBack?.({ success: result })
            document.body.removeChild(widgetNode!)
            widgetNode = undefined
        }

        function onCommandRecieved(evnt: MessageEvent) {
            if (evnt.origin.indexOf(paymentPageOrigin) === 0) {
                const resultObject = JSON.parse(evnt.data)
                onCloseDialog(resultObject.success === true)
            }
        }

        function showPaymentWidget(params: any, callBack: any) {
            paymentWidgedCallBack = callBack
            if (!widgetNode) {
                addCssClass()
                widgetNode = document.createElement("DIV")
                widgetNode.className = "widgetScreen"
                const iframeBox = document.createElement("DIV")
                iframeBox.className = "iframeBox"
                const iframe = document.createElement("IFRAME")
                iframe.src =
                    halyk.Config().pageUrL +
                    "?params=" +
                    LZString.compressToEncodedURIComponent(encodeParams(params)) +
                    "&isShortForm=true"
                iframe.className = "iframeClass"
                iframeBox.appendChild(iframe)
                widgetNode.appendChild(iframeBox)
                document.body.appendChild(widgetNode)
                window.addEventListener("message", onCommandRecieved, false)
            }
        }

        function pay(params: any) {
            location.href =
                pageUrl +
                "?params=" +
                LZString.compressToEncodedURIComponent(encodeParams(params)) +
                "&oid=" +
                params.invoiceId
        }

        function p2p(params: any) {
            location.href =
                pageUrl +
                "?params=" +
                LZString.compressToEncodedURIComponent(encodeParams(params)) +
                "&isTransfer=true"
        }

        function aft(params: any) {
            location.href =
                pageUrl +
                "?params=" +
                LZString.compressToEncodedURIComponent(encodeParams(params)) +
                "&isAFT=true"
        }

        function oct(params: any) {
            location.href =
                pageUrl +
                "?params=" +
                LZString.compressToEncodedURIComponent(encodeParams(params)) +
                "&isOCT=true"
        }

        halyk.showPaymentWidget = showPaymentWidget
        halyk.pay = pay
        halyk.p2p = p2p
        halyk.aft = aft
        halyk.oct = oct
        halyk.cardverification = pay

        // LZString (оставляем как было)
        const LZString = (function () {
            // Тело LZString можно оставить без изменений — оно работает как утилита
            // Лучше вынести в отдельный файл, но можно оставить здесь
            /* вставь сюда оригинальный код LZString из твоего файла */
            return window.LZString
        })()
    })(window.halyk || (window.halyk = {}))
})
