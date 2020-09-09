<z-modal-stack>
    <section id="modalStack">
        <!-- dynamically load modals here -->
    </section>
    <script type="es6">
        console.log('z-modal-stack')

        // Global dispatcher
        window.Z = window.Z || {}
        if (!Z.dispatcher) Z.dispatcher = riot.observable();

        // this.modals = []

        this.count = 0

        this.on('mount', () => {
            Z.dispatcher.on('modal-stack:add', (modal) => {
                console.log('adding new modal', modal)

                let child = document.createElement('div')

                riot.mount(child, modal)

                this.modalStack.appendChild(child)

                ++this.count
            })

            Z.dispatcher.on('modal-stack:remove', (modal) => {


                --this.count
            })
        })
    </script>
    <style>
    #modalStack {
        position: absolute;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        width: 100vw;
        z-index: 9;
    }

    /*#modal {
        background: url("/ui/images/alert-bg.png") #c7d4ea;
        border-radius: 5px;
        box-shadow: 2px 2px 10px #000000;
        border: 2px solid #697a91;
        position: relative;
        overflow: hidden;
    }
    #modal .close {
        background-color: #697a91;
        border: 2px #697a91 solid;
        border-top: none;
        border-right: none;
        border-radius: 0px 2px 0px 5px;
        color: #c7d4ea;
        cursor: pointer;
        line-height: 26px;
        font-family: Arial;
        height: 26px;
        padding: 0px 8px 0px 12px;
        position: absolute;
        right: 0px;
        top: 0px;
        text-decoration: none;
        letter-spacing: 0.6px;
        box-shadow: -1px 1px 1px #363E4E;
        text-shadow: 1px 1px 1px #4C5568;
    }
    #modal .close:focus {
        outline: none;
    }
    #modal .close:active {
        margin-top: -2px;
    }
    #modal .close:hover {
        background: #75869C;
    }
    */
    </style>
</z-modal-stack>
