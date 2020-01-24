<media-app-modal>
    <div id="media-app-modal">
        <z-modal modal="{opts}">
            <media-app lock="{opts.modal.lock}">
                <z-button-save handler="{parent.parent.loadImages}" id="loadImages">
                    Load Selected Files
                </z-button-save>
            </media-app>
        </z-modal>
    </div>
    <script type="es6">
        this.loadImages = () => {
            // This whole referencing nested tags would
            // probably be better served by events
            const modal = this.tags['z-modal']
            const mediaApp = modal.tags['media-app']
            const selected = mediaApp.files.reduce((acc, file) => {
                if(file.selected && !acc.find(f => f.id === file.id)) {
                    acc.push(file)
                }
                return acc
            }, [])

            opts.callback(selected)

            modal.close()
        }
    </script>
    <style>
        #media-app-modal #modal .control-bar {
            padding-right: 4rem;
        }
        #media-app-modal #modal media-app {
            height: inherit;
        }
        #media-app-modal #modal media-app #media-manager {
            height: inherit;
            display: flex;
            flex-direction: column;
        }
        #loadImages {
            position: absolute;
            bottom: 1rem;
            right: 2rem;
            z-index: 10;
        }
    </style>
</media-app-modal>
