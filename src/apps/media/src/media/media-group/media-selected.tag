<media-selected>
    <aside
        if="{selected.length}"
        id="mediaSelected">
        <article
            each="{selected}"
            class="item file"
            onclick="{parent.handleUnselect}">
            <i class="fas fa-check"></i>
            <media-thumbnail
                id="{id}"
                url="{url}"
                title="{title}"
                width="100"
                height="100">
            </media-thumbnail>
        </article>
    </aside>
    <script type="es6">
        this.selected = []
        
        this.handleUnselect = (evt) => {
            if (evt.item) {
                zesty.trigger('media:file:unselect', evt.item)

                this.update({
                    selected: this.selected.filter((file) => {
                        return file.id !== evt.item.id
                    })
                })
            }
        }

        this.on('mount', () => {
            this.selected = opts.files.filter(file => file.selected)
            zesty.on('media:file:select', (file) => {
                this.selected.push(file)
                this.update()
            })
            zesty.on('media:file:unselect', (file) => {
                this.update({
                    selected: this.selected.filter((el) => {
                        return el.id !== file.id
                    })
                })
            })
        })
    </script>
    <style scoped>
    #mediaSelected {
        display: flex;
        margin: 1rem 1rem 0 1rem;
        overflow-x: scroll;
        flex-wrap: nowrap;
    }
    #mediaSelected .item.file {
        background: #252D38;
        border-radius: 3px 3px 3px 0;
        cursor: pointer;
        display: inline-block;
        height: 100px;
        margin: 6px;
        overflow: hidden;
        position: relative;
        width: 100px;
        flex-shrink: 0;
    }
    #mediaSelected .file .fa-check {
        position: absolute;
        background: #74BE24;
        padding: 0.3rem;
        color: #FFF;
        top: 0;
        right: 0;
    }
    #mediaSelected::-webkit-scrollbar {
      background-color: #c0cee7;
      width: 5px;
      height: 5px;
    }
    #mediaSelected::-webkit-scrollbar-button {
      background-color: #c0cee7;
    }
    #mediaSelected::-webkit-scrollbar-track {
      background-color: #c0cee7;
    }
    #mediaSelected::-webkit-scrollbar-track-piece {
      background-color: #c0cee7;
    }
    #mediaSelected::-webkit-scrollbar-thumb {
      background-color: #242b3c;
    }
    #mediaSelected::-webkit-scrollbar-corner {
      background-color: #c0cee7;
    }
    #mediaSelected::-webkit-resizer {
      background-color: #c0cee7;
    }
    </style>
</media-selected>
