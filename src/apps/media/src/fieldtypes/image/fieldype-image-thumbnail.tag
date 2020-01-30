<fieldtype-image-thumbnail>
    <article class="file">
        <figure class="thumbnail">
            <img src="{getThumbnail(199, 200)}" alt="{this.image.title}">
        </figure>
        <header class="meta">
            <h1 class="title">{this.image.title}</h1>
            <z-button class="remove" handler="{handleRemove}">
                <span class="pictos">*</span>
            </z-button>
        </header>
        <div class="loaderWrap" show="{this.loading}">
            <div class="loader"></div>
        </div>
    </article>
    <script type="es6">
        this.handleRemove = (evt) => {
            evt.preventDefault()
            zesty.trigger('fieldtype-image:remove', this.image.id)
        }

        this.loadThumbnail = () => {
            let thumbnail = this.root.querySelector('img')
            let showLoading = setTimeout(() => {
                this.loading = true
                this.update()
            }, 500)

            thumbnail.addEventListener('load', (evt) => {
                clearTimeout(showLoading)
                this.loading = false
                this.update()
            })
        }

        this.getThumbnail = (width = 200, height = 200) => {
            if (this.image.id) {
                switch(DnD.getFileExt(this.image.url).toLowerCase()) {
                    case 'jpg':
                    case 'jpeg':
                    case 'png':
                    case 'gif':
                    case 'svg':
                        return `${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${this.image.id}/getimage/?w=${width}&h=${height}&type=fit`
                        break;
                    default:
                        return DnD.getFileIcon(this.image.url, '48px')
                }
            } else {
                return this.image.url
            }
        }

        this.on('mount', () => {
            this.loadThumbnail()
        })

    </script>
    <style scoped>
        .file {
            background: #252D38;
            border-radius: 3px 3px 3px 0;
            cursor: pointer;
            display: inline-block;
            height: 200px;
            margin: 6px;
            overflow: hidden;
            position: relative;
            width: 200px;
        }

        .file .thumbnail {
            height: 167px;
            width: 100%;
            display: flex;
            align-content: center;
            align-items: center;
            overflow: hidden;
            justify-content: center;
        }
        .file .thumbnail img {
            background-color: white;
            background-image: linear-gradient(45deg,#efefef 25%,transparent 25%,transparent 75%,#efefef 75%,#efefef), linear-gradient(45deg,#efefef 25%,transparent 25%,transparent 75%,#efefef 75%,#efefef);
            background-position: 0 0,10px 10px;
            background-size: 21px 21px;
            max-width: 100%;
            max-height: 100%;
        }

        .file .meta {
            background-color: #C2CEE2;
            display: flex;
            line-height: 3rem;
        }
        .file .meta .title {
            color: rgb(91, 102, 125);

            /* prevent overrides in less variables*/
            background-color: inherit;
            height: inherit;
            /*line-height: inherit;*/
            box-shadow: inherit;
            z-index: inherit;
            border-bottom: inherit;
            text-shadow: none;


            overflow: hidden;
            flex: 1;
            text-overflow: ellipsis;
            white-space: nowrap;
            vertical-align: middle;
            padding: 0 0.5rem;
            line-height: 3rem;
        }
        .file .meta button {
            margin: 0;
        }
        :scope .loaderWrap {
            background: rgba(0,0,0,0.2);
            position: absolute;
            width: 200px;
            height: 168px;
            z-index: 9;
            top: 0;
            display: flex;
        }

        @keyframes spinner {
            to {transform: rotate(360deg);}
        }

        :scope .loader {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
        }

        :scope .loader:before {
            content: 'Loading…';
            position: absolute;
            width: 21%;
            height: 25%;
        }

        :scope .loader:not(:required):before {
            content: '';
            border-radius: 50%;
            border: 5px solid rgb(76, 85, 104);
            border-top-color: rgb(234, 236, 241);
            animation: spinner .6s linear infinite;
        }
    </style>
</fieldtype-image-thumbnail>
