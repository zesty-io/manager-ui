<media-thumbnail>
    <figure class="thumbnail">
        <img src="{getThumbnail()}" alt="{opts.title}" />
        <div class="loaderWrap" show="{loading}">
            <div class="loader"></div>
        </div>
    </figure>
    <script type="es6">
        const HEIGHT = 100
        const WIDTH = 100

        this.loadThumbnail = () => {
            let thumbnail = this.root.querySelector('img')
            let showLoading = setTimeout(() => {
                this.update({
                    loading: true
                })
            }, 500)

            thumbnail.addEventListener('load', () => {
                clearTimeout(showLoading)
                this.update({
                    loading: false
                })
            })
        }

        this.getThumbnail = () => {
            let width = opts.width || WIDTH
            let height = opts.height || HEIGHT
            if (opts.id) {
                switch(DnD.getFileExt(opts.url).toLowerCase()) {
                    case 'jpg':
                    case 'jpeg':
                    case 'png':
                    case 'gif':
                    case 'svg':
                        return `${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${opts.id}/getimage/?w=${width}&h=${height}&type=fit`
                        break;
                    default:
                        return DnD.getFileIcon(opts.url, '48px')
                }
            } else {
                return opts.url
            }
        }

        this.on('mount', () => {
            let thumbnail = this.root.querySelector('.thumbnail')
            thumbnail.style.width = (opts.width || WIDTH) + 'px'
            thumbnail.style.height = (opts.height || HEIGHT) + 'px'

            let loader = this.root.querySelector('.loaderWrap')
            loader.style.width = (opts.width || WIDTH) + 'px'
            loader.style.height = (opts.height || HEIGHT) + 'px'

            this.loadThumbnail()
        })

    </script>
    <style scoped>
    @keyframes spinner {
        to {transform: rotate(360deg);}
    }
    :scope .thumbnail {
        height: 167px;
        width: 100%;
        display: flex;
        align-content: center;
        align-items: center;
        overflow: hidden;
        justify-content: center;
    }
    :scope .thumbnail img {
        background-color: white;
        background-image: linear-gradient(45deg,#efefef 25%,transparent 25%,transparent 75%,#efefef 75%,#efefef), linear-gradient(45deg,#efefef 25%,transparent 25%,transparent 75%,#efefef 75%,#efefef);
        background-position: 0 0,10px 10px;
        background-size: 21px 21px;
        max-width: 100%;
        max-height: 100%;
    }
    :scope .loaderWrap {
        background: rgba(0,0,0,0.2);
        position: absolute;
        width: 100px;
        height: 100px;
        z-index: 9;
        top: 0;
        display: flex;
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
        width: 20%;
        height: 20%;
    }
    :scope .loader:not(:required):before {
        content: '';
        border-radius: 50%;
        border: 5px solid rgb(76, 85, 104);
        border-top-color: rgb(234, 236, 241);
        animation: spinner .6s linear infinite;
    }
    </style>
</media-thumbnail>
