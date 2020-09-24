<media-group-controls>
    <h1 id="groupTitle">
        <z-button-set if="{zestyStore.getState().userRole.systemRole.delete}">
            <z-button handler="{parent.edit}" group="{parent.opts.group}">
                <span class="pictos">p</span>
            </z-button>
            <z-button handler="{parent.delete}" group="{parent.opts.group}">
                <span class="pictos">#</span>
            </z-button>
        </z-button-set>
        <span class="name">{opts.group.name}</span>
    </h1>
    <script type="es6">
        this.delete = () => {
            riot.mount(document.querySelector('#modalMount'), 'group-delete-modal', {
                group: opts.group
            })
        }

        this.edit = () => {
            riot.mount(document.querySelector('#modalMount'), 'group-edit-modal', {
                group: opts.group
            })
        }
    </script>
    <style scoped>
        #groupTitle {
            border-bottom: 1px solid #5F6F86;
            color: #A7AFBF;
            display: flex;
            padding: 1rem;
            word-break: break-all;
        }
        #groupTitle .name {
            margin-left: 1rem;
            color: #F9F9F9;
            flex: 1;
        }
    </style>
</media-group-controls>
