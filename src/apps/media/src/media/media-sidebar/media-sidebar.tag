<media-sidebar>
    <media-sidebar-item
        each="{dir in opts.bins}"
        bins="{parent.opts.bins}"
        groups="{parent.opts.groups}">
    </media-sidebar-item>
    <style scoped>
    :scope {
        background: #3c465e;
        flex-basis: 25%;
        overflow-y: scroll;
        -webkit-transform: translateZ(0);
        -moz-transform: translateZ(0);
        -ms-transform: translateZ(0);
        -o-transform: translateZ(0);
        transform: translateZ(0);
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
</media-sidebar>
