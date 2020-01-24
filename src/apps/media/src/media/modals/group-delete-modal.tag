<group-delete-modal>
    <div id="group-delete-modal">
        <z-modal>
            <div class="group-delete-modal">
                <h1>Do you want to delete the group: {parent.opts.group.name}?</h1>
                <h2><span class="pictos">!</span> (This will also delete all subgroups and files.)</h2>
                <div class="set">
                    <z-button-alert class="delete" handler="{parent.deleteGroup}">
                        Delete Group
                    </z-button-alert>
                    <z-button handler="{parent.cancel}">Cancel</z-button>
                </div>

            </div>
        </z-modal>
    </div>
    <script type="es6">
        this.cancel = () => {
            this.tags['z-modal'].unmount()
        }
        this.deleteGroup = () => {
            zesty.trigger('media:group:delete', opts.group)
            this.tags['z-modal'].unmount()
        }
    </script>
    <style>
        #group-delete-modal #modal {
            max-width: 60rem;
            height: auto;
        }
        #group-delete-modal .group-delete-modal {
            font-size: 2rem;
            padding: 1rem;
        }
        #group-delete-modal .group-delete-modal h1 {
            margin: 1.5rem 0 0.5rem 0;
            word-wrap: break-word;
        }
        #group-delete-modal .group-delete-modal h2 {
            font-size: 1.2rem;
            margin-bottom: 2rem;
        }
        #group-delete-modal .set {
            display: flex;
        }
        #group-delete-modal .set .delete {
            flex: 1;
        }
    </style>
</group-delete-modal>
