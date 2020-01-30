<fieldtype-image>
    <article class="fieldtype image">
        <header>
            <label class="title">{opts.displayName}</label>
        </header>
        <div class="dropzone">
            <section>
                <div class="controls">
                    <z-button handler="{mountMediaApp}">
                        <span hide="{parent.images.length}">Add Images</span>
                        <span show="{parent.images.length}">Update Images</span>
                        &nbsp;
                        <span>{parent.images.length}/{parent.opts.limit}</span>
                    </z-button>
                    <p if="{maxLimit}" class="error">
                        <i class="icon-warning-sign"></i>&nbsp;You have selected more images than are allowed
                    </p>
                    <p if="{!maxLimit}">
                        <span hide="{group.name}">Drop images here to upload them to your media</span>
                        <span show="{group.name}">Dropping images here will upload them to </span> {group.name}</span>
                    </p>
                </div>
                <div class="images">
                    <fieldtype-image-thumbnail
                        each="{image in images}">
                    </fieldtype-image-thumbnail>
                    <input
                        id="{opts.name}Hidden"
                        name="{opts.name}"
                        type="hidden"
                        value="{ids}" />
                </div>
            </section>
            <div class="banner" show="{dragOver}">
                <i class="icon-cloud-upload"></i>&nbsp;
                <span hide="{group.name}">Drop image to begin upload</span>
                <span show="{group.name}">Drop image to begin uploading to {group.name}</span>
            </div>
        </div>
        <footer></footer>
    </article>
    <script type="es6">
        this.on('unmount', () => {
            zesty.off('fieldtype-image:remove', this.removeImage)
        })
        this.on('mount', () => {
            // this.registerDrop()

            this.ids = opts.ids ? opts.ids.split(',') : []
            this.images = []
            this.group = {}

            zesty.on('fieldtype-image:remove', this.removeImage)

            if (this.ids.length) {
                this.fetchImages(this.ids)
            }

            if (opts.group_id) {
                this.fetchGroup(opts.group_id)
            }
        })

        this.fetchGroup = (id) => {
            request(`${CONFIG.SERVICE_MEDIA_MANAGER}/group/${id}`)
            .then(result => {
                this.update({
                    group: result.data[0]
                })
            })
        }

        this.fetchImages = (ids) => {
            let urls = ids.filter(id => id.indexOf('http') !== -1)
            let zuids = ids.filter(id => id.indexOf('http') === -1)

            // Request all zuids
            if (zuids.length) {
                request(`${CONFIG.SERVICE_MEDIA_MANAGER}/file/${zuids.join(',')}`)
                .then(json => {
                    this.update({
                        images: json.data
                    })
                })
            }
            // If URLS format and update
            if (urls.length) {
                this.update({
                    images: urls.map(url => {
                        return {
                            url: url,
                            title: url.split('/').pop()
                        }
                    })
                })
            }
        }

        // this.registerDrop = () => {
        //     let counter = 0

        //     DnD.enter(this.root.querySelector('.dropzone'), () => {
        //         counter++;
        //         this.update({
        //             dragOver: true
        //         })
        //     })
        //     DnD.leave(this.root.querySelector('.dropzone'), () => {
        //         counter--;
        //         if (counter === 0) {
        //             this.update({
        //                 dragOver: false
        //             })
        //         }
        //     })
        //     DnD.drop(this.root.querySelector('.dropzone'), (evt) => {

        //         // TODO build dropzone specific upload
        //         zesty.trigger('upload:file', evt)

        //         this.update({
        //             dragOver: false
        //         })
        //     })
        // }

        this.mountMediaApp = (e) => {
            riot.mount(document.querySelector('#modalMount'), 'media-app-modal', {
                callback: this.addImages.bind(this),
                limit: opts.limit,
                lock: opts.group_id
            })
        }

        this.addImages = function addImages(images) {
            // filter out images already added
            const deduped = images.filter(img => {
                if (this.ids.indexOf(img.id) === -1) {
                    return img
                }
            })
            const combined = [...this.images, ...deduped]

            // Only allow adding more if images
            // has not exceeded field limit
            if (combined.length <= opts.limit) {
                this.update({
                    maxLimit: false,
                    images: combined,
                    ids: this.getIds(combined)
                })
            } else {
                this.update({
                    maxLimit: true
                })
            }

            basil.change_detected = true
            basil.section_object.hasUnsavedChanges = true

            // Broadcast change
            zesty.trigger('fieldtype-image:add', combined)
        }

        this.removeImage = (id) => {
            const images = this.images.filter(img => {
                if (img.id !== id) {
                    return img
                }
            })

            basil.change_detected = true
            basil.section_object.hasUnsavedChanges = true

            this.update({
                images: images,
                ids: this.getIds(images)
            })
        }

        this.getIds = (images) => {
            return images.map(img => img.id).join(',')
        }
    </script>
    <style media="scoped">
        .fieldtype.image {
            margin-bottom: 2rem;
            clear: both;
        }
        .fieldtype.image .title {
            display: block;
            font-family: 'Gibson Light', Arial;
            font-weight: normal;
            <!--  font-size: 1.4rem;  -->
            margin-bottom: 5px;
            margin-top: 0px;
        }
        .fieldtype.image section {
            display: flex;
            flex-direction: column;
            background: #EFF5FF;
            border: 1px solid #9FB7DF;
            padding: 1rem;
            border-radius: 4px;
        }
        .fieldtype.image section .controls {
            display: flex;
            flex-direction: row;
            margin: 1rem;
        }
        .fieldtype.image section .controls p {
            <!--  font-size: 1.4rem;  -->
            font-weight: 600;
            margin-left: 1rem;
            padding: 0.5rem;
        }
        .fieldtype.image section .controls .error {
            background-color: #F9F9F0;
        }
        .fieldtype.image section .images {
            flex: 1;
            display: flex;
            flex-wrap: wrap;
        }
        .fieldtype.image section .images p {
            <!--  font-size: 1.4rem;  -->
            font-weight: 700;
        }
        .fieldtype.image section z-button button {
            margin: 0;
        }


        .dropzone {
            position: relative;
        }
        .banner {
            background: rgba(27,32,44,0.7);
            position: absolute;
            height: 100%;
            width: 100%;
            <!--  font-sifont-sizeze: 1.8rem;  -->
            display: flex;
            color: #EFEFEF;
            text-shadow: 1px 1px 1px #000;
            justify-content: center;
            align-items: center;
            top: 0;
        }

    </style>
</fieldtype-image>
