<z-button-save>
    <button
        class="{alert: opts.type === 'alert'}"
        onclick="{opts.handler}"
        style="line-height: {opts.height};"
        data-id="{this.id}">
        <yield></yield>
    </button>
    <style scoped>
        :scope button {
            border: none;
            border-radius: 3px 3px 0px 3px;
            cursor: pointer;
            background: #74BE24;
            color: #EFEFEF;
            text-shadow: 1px 1px 1px #3A650B;
            border-bottom: 3px solid #67ae1b;
            border-right: 2px solid #67ae1b;
            letter-spacing: 0.4px;
            padding: 0.5rem 0.8rem;
        }
        :scope button:hover {
            background: rgb(126, 204, 42);
        }
        :scope button:active {
            border-bottom-width: 2px;
            margin-top: 1px;
        }
        :scope button:focus {
            outline: none;
        }
    </style>
</z-button-save>
