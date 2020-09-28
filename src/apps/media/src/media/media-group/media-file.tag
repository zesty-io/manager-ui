<media-file>
    <article
        class="item file {selected: opts.file.selected} {failed: opts.file.failed}"
        onclick="{handleSelect}"
        data-id="{opts.file.id}"
        draggable="true">

        <z-button
            show="{!opts.file.loading}"
            class="select {selected: opts.file.selected}"
            title="Select this image">
            <i class="fas fa-check"></i>
        </z-button>

        <section class="thumbnail {progress: opts.file.progress}">
            <img src="{this.getThumbnail(opts.file)}" alt="{opts.file.title}" />
        </section>

        <footer class="controls" title="Load image preview">
            <z-button handler="{handlePreview}" height="1.1rem">
                <i class="fas fa-cog"></i>
            </z-button>
            <h1 class="preview" onclick="{handlePreview}">
                {opts.file.title}
            </h1>
        </footer>

        <div class="progress" show="{opts.file.progress}">
            <span style="width: {opts.file.progress}%"></span>
        </div>

        <div class="loaderWrap" show="{opts.file.loading}">
            <div class="loader"></div>
        </div>

    </article>
    <div class="arrow-down" show="{opts.file.preview}"></div>

    <script type="es6">
        this.handleSelect = (evt) => {
            evt.stopPropagation()
            if (!opts.file.loading && opts.file.id) {
                opts.file.selected = opts.file.selected ? false : true;
                if (opts.file.selected) {
                    zesty.trigger('media:file:select', opts.file)
                } else {
                    zesty.trigger('media:file:unselect', opts.file)
                }
            }
        }

        this.handlePreview = (evt) => {
            evt.stopPropagation()
            if (opts.file.preview) {
                zesty.trigger('media:file:preview')
            } else {
                zesty.trigger('media:file:preview', opts.file.id)
            }
        }

        this.handleDelete = (evt) => {
            evt.stopPropagation()
            zesty.trigger('media:file:delete', opts.file)
        }

        this.getThumbnail = (file) => {
            if (file.url) {
                // Check if this is an in memory blob
                // which was just uploaded
                if (file.url.indexOf('blob:') !== -1) {
                    return encodeURI(file.url)
                } else {
                    switch(DnD.getFileExt(file.url).toLowerCase()) {
                        case 'jpg':
                        case 'jpeg':
                        case 'png':
                        case 'gif':
                        case 'svg':
                            return `${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${opts.file.id}/getimage/?w=200&h=200&type=fit`
                            break;
                        default:
                            return DnD.getFileIcon(file.url, '48px')
                    }
                }
            } else {
                return ''
            }
        }

        this.loadThumbnail = () => {
            let thumbnail = this.root.querySelector('img')
            let showLoading = setTimeout(() => {
                opts.file.loading = true
                this.update()
            }, 500)

            thumbnail.addEventListener('load', (evt) => {
                clearTimeout(showLoading)
                opts.file.loading = false
                this.update()
            })
        }

        this.post = () => {
            const xhr = new XMLHttpRequest()
            const body = new FormData()
            const api = `${CONFIG.SERVICE_MEDIA_STORAGE}/upload/${opts.file.storage_driver}/${opts.file.storage_name}`

            body.append('file', opts.file.file)
            body.append('bin_id', opts.file.bin_id)
            body.append('group_id', opts.file.group_id)
            body.append('user_id', zestyStore.getState().user.ZUID)

            xhr.withCredentials = true

            xhr.upload.addEventListener('progress', (evt) => {
                if (evt.lengthComputable) {
                    opts.file.progress = Math.round((evt.loaded * 100) / evt.total)
                } else {
                    // file length wasn't known so don't show upload bar
                    opts.file.progress = 0
                }

                this.update()
            })

            xhr.upload.addEventListener('abort', (err) => {
                console.error('Abort: ', err)
                growl('File upload aborted')
                opts.file.failed = true
            })

            xhr.upload.addEventListener('error', (err) => {
                console.error('Error: ', err)
                growl('File upload failed', 'red-growl')
                opts.file.failed = true
            })

            // @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState
            xhr.onreadystatechange = () => {
                console.log('onreadystatechange', opts.file.filename, xhr.readyState)

                if (xhr.readyState === XMLHttpRequest.OPENED) {
                    opts.file.upload = false
                    opts.file.loading = true
                    this.update()
                }

                if (xhr.readyState == XMLHttpRequest.DONE) {
                    const json = JSON.parse(xhr.responseText)

                    if (/200|201/.test(json.code)) {
                        growl(`Uploaded ${opts.file.filename}`)

                        // Added new values returned by server
                        // to this file instance
                        opts.file = Object.assign(opts.file, json.data[0])

                    } else {
                        opts.file.failed = true
                        growl(json.message, 'red-growl')
                    }

                    opts.file.progress = 0
                    opts.file.loading = false

                    this.update()
                }
            }

            xhr.open('POST', api)
            xhr.send(body)
        }

        this.handleDeselect = (file) => {
            if (file.id === opts.file.id) {
                opts.file.selected = false
                this.update()
            }
        }

        this.on('unmount', () => {
            zesty.off('media:file:unselect', this.handleDeselect)
        })

        this.on('mount', () => {
            DnD.start(this.root.querySelector('.file'), 'file', opts.file)

            if (opts.file.upload) {
                this.post()
            } else {
                this.loadThumbnail()
            }

            zesty.on('media:file:unselect', this.handleDeselect)
        })
    </script>
    <style scoped>
    .item.failed {
        opacity: 0.6;
        cursor: not-allowed;
    }
    .item.file {
        background: #252D38;
        border-radius: 3px 3px 3px 0;
        cursor: pointer;
        display: inline-block;
        height: 200px;
        margin: 8px;
        overflow: hidden;
        position: relative;
        width: 200px;
    }
    .item.file.selected {
        box-shadow: 0px 0px 6px #15181D;
    }

    :scope .file .thumbnail {
        height: 167px;
        width: 100%;
        display: flex;
        align-content: center;
        align-items: center;
        overflow: hidden;
        justify-content: center;
    }
    :scope .file .thumbnail.progress {
        opacity: 0.5;
    }

    :scope .file .thumbnail img {
        background-color: white;
        background-image: linear-gradient(45deg,#efefef 25%,transparent 25%,transparent 75%,#efefef 75%,#efefef), linear-gradient(45deg,#efefef 25%,transparent 25%,transparent 75%,#efefef 75%,#efefef);
        background-position: 0 0,10px 10px;
        background-size: 21px 21px;
        max-width: 100%;
        max-height: 100%;
    }

    :scope .file z-button button {
        border: none;
        border-radius: 0;
    }

    :scope .file .select {
        display: none;
        position: absolute;
        top: 0;
        right: 0;
    }
    :scope .file:hover .select,
    :scope .file:active .select,
    :scope .file:focus .select,
    :scope .file .select.selected {
        display: block;
    }
    :scope .file .select.selected button {
        background: #74BE24;
    }

    :scope .file .content {
        flex: 1
    }
    :scope .progress {
        height: 10px;
        width: 120px;
    }
    :scope .progress span {
        background: #f1a165;
        display: block;
        height: 3rem;
        position: absolute;
        opacity: 0.7;
        bottom: 0;
    }

    .item.file .controls {
        background-color: #C2CEE2;
        display: flex;
        align-items: center;
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 32px;
    }

    .item.file .controls .preview {
        overflow: hidden;
        flex: 1;
        text-overflow: ellipsis;
        white-space: nowrap;
        vertical-align: middle;
        padding: 0 0.5rem;
        <!--  line-height: 3rem;  -->
    }

    :scope {
        position: relative;
        display: inline-block;
    }
    :scope .arrow-down {
        width: 0;
        height: 0;
        border-left: 15px solid transparent;
        border-right: 15px solid transparent;
        border-top: 15px solid #5B667D;
        position: absolute;
        bottom: -8px;
        left: 6px;
    }

    .loaderWrap {
        background: rgba(0,0,0,0.5);
        position: absolute;
        width: 200px;
        /* height: 200px; */
        height: 168px;
        z-index: 9;
        top: 0;
        display: flex;
    }

    @keyframes spinner {
        to {transform: rotate(360deg);}
    }

    .loader {
        min-width: 24px;
        min-height: 24px;
    }

    .loader:before {
        content: 'Loading…';
        position: absolute;
        top: 57%;
        left: 45%;
        width: 30px;
        height: 30px;
        margin-top: -10px;
        margin-left: -10px;
    }

    .loader:not(:required):before {
        content: '';
        border-radius: 50%;
        border: 5px solid rgb(76, 85, 104);
        border-top-color: rgb(234, 236, 241);
        animation: spinner .6s linear infinite;
        margin-top: -3rem;
    }
    </style>
</media-file>
