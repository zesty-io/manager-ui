<z-search-field>
    <div class="z-search-field">
        <z-button>
            <i if="{!parent.opts.loading}" class="icon-search"></i>
            <i if="{parent.opts.loading}" class="loader"></i>
        </z-button>
        <input
            type="text"
            onkeydown="{handleKeydown}"
            onkeyup="{debounce}"
            placeholder="{opts.placeholder}" />
    </div>
    <script type="es6">
        this.current
        this.blacklist = [9, 16, 17, 18, 91, 32, 93, 37, 40, 39, 38]
        this.debounce = (evt) => {
            if (this.blacklist.indexOf(evt.keyCode) === -1) {
                if (this.current) {
                    clearTimeout(this.current)
                }
                this.current = setTimeout(() => {
                    opts.handler(evt)
                }, 250)
            }
        }
        this.handleKeydown = (evt) => {
            // HACK to fix riot.js triggering fake "click" events on tags
            if (evt.keyCode === 13 || evt.which === 13 || evt.code === 'Enter') {
                evt.preventDefault()
            } else {
                return true
            }
        }
    </script>
    <style scoped>
    :scope {
        flex: 1;
    }
    :scope .z-search-field {
        display: flex;
    }
    :scope z-button button {
        margin: 0 0 0 0.5rem;
    }
    :scope input {
        border: none;
        border-radius: 0px 3px 3px 0px;
        flex: 1;
        padding: 0 0 0 1em;
        color: rgb(91, 102, 125);
        border-bottom: 3px solid #6F819A;
        background: #EAECF1;
    }
    :scope input:hover {}
    :scope input:focus {
        outline: none;
    }

    :scope .loader,
    :scope .loader:after {
      border-radius: 50%;
      width: 1.6em;
    height: 1.6em;
      display: block;
    }
    :scope .loader {
      position: relative;
      text-indent: -9999em;
      border-top: 4px solid rgba(255, 255, 255, 0.2);
      border-right: 4px solid rgba(255, 255, 255, 0.2);
      border-bottom: 4px solid rgba(255, 255, 255, 0.2);
      border-left: 4px solid #ffffff;
      -webkit-transform: translateZ(0);
      -ms-transform: translateZ(0);
      transform: translateZ(0);
      -webkit-animation: load8 1.1s infinite linear;
      animation: load8 1.1s infinite linear;
    }
    @-webkit-keyframes load8 {
      0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }
    @keyframes load8 {
      0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }

    </style>
</z-search-field>
