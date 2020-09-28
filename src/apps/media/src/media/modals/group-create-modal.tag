<group-create-modal>
    <div id="group-create-modal">
        <z-modal>
            <div class="group-create-modal">
                <z-button handler="{parent.createGroup}">
                    Create Group
                </z-button>
                <input type="text" name="newGroupName" placeholder="Name your new group" />
            </div>
        </z-modal>
    </div>
    <script type="es6">
        this.on('mount', () => {
            this.tags['z-modal'].newGroupName.focus()
            document.addEventListener('keyup', this.onEnter)
        })
        this.on('unmount', () => {
            document.removeEventListener('keyup', this.onEnter)
        })
        this.onEnter = (e) => {
            if (13 == e.which) {
                this.createGroup(e)
            }
        }
        this.createGroup = () => {
            let name = this.tags['z-modal'].newGroupName.value
            if (name) {
                zesty.trigger('media:group:create', name)
            }
            this.tags['z-modal'].unmount()
        }
    </script>
    <style>
        #group-create-modal #modal {
            height: 9rem;
            width: 60%;
            max-width: 60rem;
        }
        #group-create-modal .group-create-modal {
            display: flex;
            margin-top: 2.6rem;
            padding: 1rem;
        }
        #group-create-modal button {
            line-height: 2.5rem;
        }
        #group-create-modal .group-create-modal input {
            border: none;
            border-radius: 0px 3px 3px 0px;
            flex: 1;
            padding: 0 0 0 1em;
            color: rgb(91, 102, 125);
            border-bottom: 3px solid #6F819A;
            background: #EAECF1;
        }
    </style>
</group-create-modal>
