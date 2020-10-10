<z-modal>
    <section id="modal">
        <button class="close" onclick="{close}">
            <span class="pictos">X</span>
        </button>
        <yield />
    </section>
    <script type="es6">
        this.on('mount', () => {
            this.modal.addEventListener('click', this.handleModalClick)
            this.root.addEventListener('click', this.handleRootClick)
            if (!opts.secure) {
                document.addEventListener('keyup', this.closeOnEsc)
            }
        })
        this.on('unmount', () => {
            this.modal.removeEventListener('click', this.handleModalClick)
            this.root.removeEventListener('click', this.handleRootClick)
            document.removeEventListener('keyup', this.closeOnEsc)
        })
        this.close = () => {
            this.unmount()
        }
        this.closeOnEsc = (e) => {
            if (27 == e.which) {
                this.unmount()
            }
        }
        this.handleModalClick = (evt) => {
            // Don't let click events bubble outside
            // of the modal.
            evt.stopPropagation()
        }
        this.handleRootClick = (evt) => {
            // If we detect a click event at the root
            // then we know it was outside the modal
            // and we should close it
            this.unmount()
        }
    </script>
    <style>
    z-modal {
        position: absolute;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        width: 100vw;
        z-index: 30;
        top: 0;
    }
    #modal {
        background: #c7d4ea;
        border-radius: 10px;
        position: relative;
        overflow: hidden;
        width: 90vw;
        height: 90vh;
    }
    #modal .close {
        background-color: #576374;
        color: #c7d4ea;
        cursor: pointer;
        padding: 0.5rem 0.8rem;
        position: absolute;
        right: -1px;
        top: -1px;
        text-decoration: none;
        border: none;
        font-weight: 500;
        z-index: 10;
        border-radius: 0 10px 0 10px;
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
    </style>
</z-modal>
