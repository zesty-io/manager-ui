<group-edit-modal>
    <div id="group-edit-modal">
        <z-modal>
            <div class="group-edit-modal">
                <z-button handler="{parent.editGroup}">Rename Group</z-button>
                <input type="text" name="editGroupName" placeholder="{parent.opts.group.name}" />
            </div>
        </z-modal>
    </div>
    <script type="es6">
        this.on('mount', () => {
            this.tags['z-modal'].editGroupName.focus()
            document.addEventListener('keyup', this.onEnter)
        })
        this.on('unmount', () => {
            document.removeEventListener('keyup', this.onEnter)
        })
        this.onEnter = (e) => {
            if (13 == e.which) {
                this.editGroup()
            }
        }
        this.editGroup = () => {
            if (this.tags['z-modal'].editGroupName.value) {
                opts.group.name = this.tags['z-modal'].editGroupName.value

                if (opts.group.type === 'bin') {
                    zesty.trigger('media:bin:save', opts.group)

                } else if (opts.group.type === 'group') {
                    zesty.trigger('media:group:save', opts.group)

                }
            }
            this.tags['z-modal'].unmount()
        }
    </script>
    <style>
        #group-edit-modal #modal {
            height: 9rem;
            width: 60%;
            max-width: 60rem;
        }
        #group-edit-modal .group-edit-modal {
            display: flex;
            margin-top: 2rem;
            padding: 1rem;
        }
        #group-edit-modal .group-edit-modal input {
            border: none;
            border-radius: 0px 3px 3px 0px;
            flex: 1;
            padding: 0 0 0 1em;
            color: rgb(91, 102, 125);
            border-bottom: 3px solid #6F819A;
            background: #EAECF1;
        }
        #group-edit-modal button {
            line-height: 2.5rem;
        }
    </style>
</group-edit-modal>
