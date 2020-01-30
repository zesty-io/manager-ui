<media-drawer>
    <aside id="media-drawer" if="{opts.file}">
        <button class="close" onclick="{close}">
            <span class="pictos">*</span>
        </button>
        <div class="meta-info" show="{opts.file.url}">
            <z-text-field class="title" label="Title" value="{opts.file.title}"></z-text-field>
            <z-text-field class="filename" label="Filename" value="{opts.file.filename}"></z-text-field>
            <z-copy-field label="Copy" value="{opts.file.url}" disabled="true"></z-copy-field>
            <div if="{zesty.user.permissions.can_delete}" class="controls">
                <z-button-save class="update" handler="{save}">
                    <span if="{!parent.opts.file.saving}">
                        Save&nbsp;<small>(CTRL + S)</small>
                    </span>
                    <span if="{parent.opts.file.saving}">
                        <span class="loader"></span>&nbsp;Saving
                    </span>
                </z-button-save>
                <z-button-alert class="update" handler="{remove}">
                    <i class="icon-trash"></i>&nbsp;Delete
                </z-button-alert>
            </div>
        </div>
        <div class="preview">
            <img if="{type === 'image'}" src="{opts.file.url}" alt="{opts.file.title}" />
            <video if="{type === 'video'}" src="{opts.file.url}" controls="true" preload="metadata"></video>
            <audio if="{type === 'audio'}" src="{opts.file.url}" controls="true" volume="0.3" preload="metadata"></audio>
        </div>
        <div class="loaderWrap" if="{loadingPreview}">
            <div class="loader"></div>
        </div>
    </aside>
    <script type="es6">
        this.close = () => {
            zesty.trigger('media:file:preview')
        }

        this.remove = () => {
            zesty.trigger('media:file:delete', opts.file)
            this.update({
                loadingPreview: true
            })
        }

        this.save = () => {
            console.log('media-drawer:save', opts)

            let title = this.root.querySelector('.meta-info .title input')
            let filename = this.root.querySelector('.meta-info .filename input')

            opts.file.title = title.value
            opts.file.filename = filename.value
            opts.file.saving = true

            this.update()

            // Delay trigger update to avoid
            // UI jank on quick updates
            setTimeout(() => {
                zesty.trigger('media:file:save', opts.file)
            }, 500)
        }

        this.saveOnKey = (evt) => {
            if (83 == evt.which && (evt.metaKey || evt.ctrlKey)) {
                evt.preventDefault()
                evt.stopPropagation()
                this.save()
            }
        }

        this.getType = (file) => {
            let ext = file.url.split('.').pop()
                switch(ext.toLowerCase()) {
                    case 'mov':
                    case 'mp4':
                    case 'ogv':
                    case 'webm':
                        return 'video'
                        break;
                    case 'jpg':
                    case 'jpeg':
                    case 'png':
                    case 'gif':
                    case 'svg':
                    case 'webp':
                        return 'image'
                        break;
                    case 'mp3':
                        return 'audio'
                        break;
                }
        }

        this.on('update', () => {
            if (opts.file) {
                this.type = this.getType(opts.file)
            } else {
                this.type = ''
            }
        })

        this.on('mount', () => {
            this.loadingPreview = false
            document.addEventListener('keydown', this.saveOnKey)
        })

        this.on('unmount', () => {
            document.removeEventListener('keydown', this.saveOnKey)
        })

    </script>
    <style scoped>
    :scope {
        flex-grow: 1;
        flex-basis: 100%;
    }
    #media-drawer {
        background: #a7afbf;
        display: flex;
        margin: 2rem 0;
        box-shadow: 0 0 10px 0 #3c465e;
        position: relative;
    }
    #media-drawer .preview {
        border-left: 1px solid #697A91;
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: center;
    }
    #media-drawer .preview img {
        max-width: 100%;
    }
    #media-drawer .preview audio,
    #media-drawer .preview video {
        width: 100%;
    }
    #media-drawer .meta-info {
        border-right: 1px solid #D0D3D8;
        padding: 2em 1em;
        min-width: 20vw;
    }
    #media-drawer .meta-info .controls {
        display: flex;
        justify-content: space-between;
    }
    #media-drawer .update {
        display: block;
        margin: 1em 0;
        position: relative;
    }
    #media-drawer .update small {
        <!--  font-size: 1rem;  -->
    }
    #media-drawer .update .loader {
        min-width: 16px;
        min-height: 14px;
        display: inline-block;
    }
    #media-drawer .update .loader:before {
        position: absolute;
        top: 8px;
        left: 8px;
        width: 8px;
        height: 8px;
        margin-top: 0;
        margin-left: 0;
    }
    #media-drawer .update .loader:not(:required):before {
        content: '';
        border-radius: 50%;
        border: 3px solid rgb(76, 85, 104);
        border-top-color: rgb(234, 236, 241);
        animation: spinner .6s linear infinite;
    }

    /* Close Button */
    #media-drawer .close {
        background-color: #8897AB;
        color: #c7d4ea;
        cursor: pointer;
        <!--  font-size: 1.7rem;  -->
        font-family: Arial;
        padding: 0.2rem 0.5rem;
        position: absolute;
        right: 0px;
        top: 0px;
        text-decoration: none;
        box-shadow: inset 1px -1px 1px #71849E;
        text-shadow: -1px 1px 1px #6F7E92;
        border: none;
        font-weight: 500;
        z-index: 1;
    }
    #media-drawer .close:focus {
        outline: none;
    }
    #media-drawer .close:active {
        margin-top: -2px;
    }
    #media-drawer .close:hover {
        background: #75869C;
    }

    /* Loader */
    @keyframes spinner {
        to {transform: rotate(360deg);}
    }
    #media-drawer .loaderWrap {
        background: rgba(0,0,0,0.4);
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 9;
        top: 0;
        display: flex;
    }
    #media-drawer .loader {
        min-width: 24px;
        min-height: 24px;
    }
    #media-drawer .loader:before {
        content: 'Loading…';
        position: absolute;
        top: 45%;
        left: 45%;
        width: 50px;
        height: 50px;
        margin-top: -10px;
        margin-left: -10px;
    }
    #media-drawer .loader:not(:required):before {
        content: '';
        border-radius: 50%;
        border: 5px solid rgb(76, 85, 104);
        border-top-color: rgb(234, 236, 241);
        animation: spinner .6s linear infinite;
    }
    </style>
</media-drawer>
