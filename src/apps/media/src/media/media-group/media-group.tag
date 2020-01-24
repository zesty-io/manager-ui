<media-group>
    <section id="mediaList">
        <media-group-controls
            group="{opts.group}">
        </media-group-controls>

        <div id="dropMessage">
            <h1><i class="icon-upload-alt"></i>&nbsp;Drop and upload!</h1>
        </div>

        <media-group-row
            each="{files in rows}"
            files="{files}"
            loading="{parent.opts.loading}">
        </media-group-row>

        <div show="{opts.loading}" class="loading">
            <img src="/ui/images/zesty_loading_transparent.gif" />
        </div>

        <div class="empty" if="{(!opts.group.files || !opts.group.files.length) && !opts.loading}">
            <p>Drag &amp; drop files here</p>
            <p class="or">or</p>
            <z-button id="assetUpload" handler="{showFileModal}">
                <i class="icon-cloud-upload"></i>&nbsp;Choose Files to Upload
            </z-button>
            <input type="file" id="upload" name="upload" onchange="{handleFileUpload}" multiple />
        </div>
    </section>
    <div if="{loading}" class="lazyLoad">
        <img src="/ui/images/zesty_loading_transparent.gif" />
    </div>
    <script type="es6">
        const MAX_ROWS = 10

        this.ticking = false
        this.rows = []

        this.generateRows = () => {
            if (opts.group.files && opts.group.files.length) {
                let files = [...opts.group.files].reverse()
                let fileWidth = 215
                let filesPerRow = Math.floor(this.mediaList.clientWidth / fileWidth)
                // filesPerRow must avoid zero divison
                let rowCount = Math.ceil(files.length / (filesPerRow || 1))
                let rows = Array.apply(null, Array(rowCount)).map((_, i) => {
                    let start = i * filesPerRow
                    let end = start + filesPerRow
                    return files.slice(start, end)
                })

                return rows
            } else {
                return []
            }
        }

        this.getRows = (count) => {
            const rows = this.generateRows()
            return rows.splice(0, count)
        }

        this.showFileModal = () => {
            this.upload.click()
            return false
        }

        this.handleFileUpload = (evt) => {
            let files = []
            for (var i = evt.target.files.length - 1; i >= 0; i--) {
                files.push(this.getFileModel(evt.target.files[i]))
            }

            zesty.trigger('media:file:upload', files)
        }

        this.getFileModel = (file) => {
            return {
                bin_id: opts.bin_id,
                group_id: opts.group.id,
                filename: file.name,
                title: file.name,
                type: 'file',
                file: file,
                url: window.URL.createObjectURL(file),
                onload: function() {
                    window.URL.revokeObjectURL(this.url)
                },
                progress: 0,
                loading: false,
                upload: true,
                storage_name: opts.storage_name,
                storage_driver: opts.storage_driver
            }
        }

        // This took quite a bit of tweaking to get the
        // markup and event handling to work smoothly.
        // The main issue being if counting enters and leaves
        // to determine when to show or hide the drop message
        // updating the dom can skew the enter counts if an element
        // fires an enter and then is hidden, because it then never
        // fires a leave event.
        this.handleDnD = () => {
            var counter = 0

            this.unregisterDndEnter = DnD.enter(this.root, (evt) => {
                counter++;
                this.dropMessage.style.display = 'flex'
            })
            this.unregisterDndLeave = DnD.leave(this.root, (evt) => {
                counter--;
                if (counter === 0) {
                    this.dropMessage.style.display = 'none'
                }
            })

            // This no-op makes mediaList a dropzone
            this.unregisterDndOver = DnD.over(this.root, () => {})
            this.unregisterDndDrop = DnD.drop(this.root, (evt) => {
                counter = 0
                this.dropMessage.style.display = 'none'

                let files = []
                for (var i = evt.dataTransfer.files.length - 1; i >= 0; i--) {
                    files.push(this.getFileModel(evt.dataTransfer.files[i]))
                }

                zesty.trigger('media:file:upload', files)
            })
        }

        this.handleResize = () => {
            ;(() => {
                var throttle = (type, name, obj) => {
                    obj = obj || window;
                    var running = false;
                    var func = function() {
                        if (running) { return; }
                        running = true;
                         requestAnimationFrame(() => {
                            obj.dispatchEvent(new CustomEvent(name));
                            running = false;
                        });
                    };
                    obj.addEventListener(type, func);
                };

                /* init - you can init any event */
                throttle("resize", "optimizedResize");
            })();

            // handle event
            window.addEventListener("optimizedResize", () => {
                this.update({
                    rows: this.getRows(this.rows.length)
                })
            });
        }

        this.handleScroll = (evt) => {
            if (!this.ticking) {
                window.requestAnimationFrame(() => {
                    let bound = evt.target.scrollHeight
                    let height = evt.target.clientHeight
                    let scroll = evt.target.scrollTop

                    // If we've scrolled more than 75%
                    if ((height + scroll) >= (bound * .75)) {
                        // Row recalculation occurs in update
                        this.update({
                            loading: true
                        })
                    }

                    this.ticking = false
                })
            }
            this.ticking = true;
        }

        this.on('update', () => {
            let loading = false

            // Only generate rows if we are not
            // actively loading files
            if (!this.opts.loading) {
                const allRows = this.generateRows()
                const inViewRows = this.getRows(this.rows.length + MAX_ROWS)

                if (inViewRows.length !== MAX_ROWS) {
                    loading = (inViewRows.length >= allRows.length) ? false : true
                }

                this.rows = inViewRows
            }

            this.loading = loading
        })

        this.on('mount', () => {
            this.handleDnD()
            this.handleResize()
            this.root.addEventListener('scroll', this.handleScroll)
        })

        this.on('unmount', () => {
            this.root.removeEventListener('scroll', this.handleScroll)
            this.unregisterDndEnter()
            this.unregisterDndLeave()
            this.unregisterDndOver()
            this.unregisterDndDrop()
        })

    </script>
    <style scoped>
    :scope {
        background: #697A91;
        box-shadow: inset 0px 0px 6px #333;
        display: flex;
        flex: 1;
        flex-direction: column;
        overflow-y: scroll;
        -webkit-transform: translateZ(0);
        -moz-transform: translateZ(0);
        -ms-transform: translateZ(0);
        -o-transform: translateZ(0);
        transform: translateZ(0);
        padding: 1em;
    }
    :scope #mediaList {
        height: 100%;
        width: 100%;
        position: relative;
    }
    :scope #dropMessage {
        display: none;
        background-color: rgba(27, 32, 44, 0.95);
        color: #EFEFEF;
        font-size: 4rem;
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        justify-content: center;
        align-content: center;
        align-items: center;
        z-index: 10;
    }
    :scope .loading img,
    :scope .lazyLoad img {
        margin: 0 auto;
        width: 100px;
        display: block;
    }
    :scope .lazyLoad {
        display: flex;
        padding: 8rem;
        align-items: center;
        justify-content: center;
    }
    :scope .empty,
    :scope .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 70vh;
        flex-direction: column;
        font-size: 3.7rem;
        color: #EEE;
        line-height: 5rem;
        font-weight: 900;
        text-align: center;
    }
    :scope .empty .or {
        font-size: 3rem;
    }
    :scope .empty z-button button {
        font-size: 3rem;
        font-weight: 500;
        padding: 1rem 1.5rem;
    }

    :scope #upload {
        visibility: hidden;
        width: 1px;
        height: 1px;
    }

    :scope::-webkit-scrollbar {
      background-color: #c0cee7;
      width: 5px;
      height: 5px;
    }
    :scope::-webkit-scrollbar-button {
      background-color: #c0cee7;
    }
    :scope::-webkit-scrollbar-track {
      background-color: #c0cee7;
    }
    :scope::-webkit-scrollbar-track-piece {
      background-color: #c0cee7;
    }
    :scope::-webkit-scrollbar-thumb {
      background-color: #242b3c;
    }
    :scope::-webkit-scrollbar-corner {
      background-color: #c0cee7;
    }
    :scope::-webkit-resizer {
      background-color: #c0cee7;
    }

    </style>
</media-group>
