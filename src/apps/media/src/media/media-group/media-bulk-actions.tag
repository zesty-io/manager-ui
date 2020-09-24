<media-bulk-actions>
    <div class="bulkActions tooltip">
        <z-tooltip>
            <span class="tip"></span>
            <ul>
                <li><span class="pictos">W</span>&nbsp;Edit Files</li>
                <hr />
                <li><span class="pictos">#</span>&nbsp;Delete Files</li>
            </ul>
        </z-tooltip>
    </div>
    <script type="es6">
        this.edit = () => {

        }
        this.delete = () => {

        }
    </script>
    <style media="scoped">
        .bulkActions {
            background: rgba(154, 172, 195, 0.3);
            border-radius: 3px;
            display: none;
            min-width: 11rem;
            padding: 0.5rem;
            position: absolute;
            right: -1px;
            z-index: 10;
        }
        :scope z-tooltip {}
        :scope .bulkActions ul {
            background: rgba(195, 205, 223, 0.9);
            padding: 1rem;
        }
        :scope .bulkActions ul hr {
            margin: 1rem 0;
            height: 0;
            background: #C3CDDF;
            border-top: 1px solid #C8D2E4;
            border-bottom: 1px solid #AFBAD0;
            border-left: none;
            border-right: none;
        }
        :scope .bulkActions ul li {
            color: #5B667D;
            text-shadow: 1px 1px 1px #C3CDDF;
            /*padding: 1rem 0 0;*/
            /*text-align: right;*/
        }


        :scope .selectAll {
          /*text-transform: uppercase;*/
          /*background: #ececec;*/
          /*color: #555;*/
          /*cursor: help;*/
          /*margin: 100px 75px 10px 75px;*/
          /*padding: 15px 20px;*/
          position: relative;
          z-index: 10;
          /*text-align: center;*/
          /*width: 200px;*/
          -webkit-transform: translateZ(0); /* webkit flicker fix */
          -webkit-font-smoothing: antialiased; /* webkit text rendering fix */
        }

        :scope .selectAll .tooltip {
          /*background: #1496bb;*/
          /*bottom: 100%;*/
          /*color: #fff;*/
          /*display: block;*/
          /*left: -25px;*/
          /*margin-bottom: 15px;*/
          /*opacity: 0;*/
          /*padding: 20px;*/
          /*pointer-events: none;*/
          /*position: absolute;*/
          /*width: 100%;*/
          /*z-index: 10;*/
          -webkit-transform: translateY(10px);
             -moz-transform: translateY(10px);
              -ms-transform: translateY(10px);
               -o-transform: translateY(10px);
                  transform: translateY(10px);
          -webkit-transition: all .25s ease-out;
             -moz-transition: all .25s ease-out;
              -ms-transition: all .25s ease-out;
               -o-transition: all .25s ease-out;
                  transition: all .25s ease-out;
          -webkit-box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.28);
             -moz-box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.28);
              -ms-box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.28);
               -o-box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.28);
                  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.28);
        }

        /* This bridges the gap so you can mouse into the tooltip without it disappearing */
        :scope .selectAll .tooltip:before {
          bottom: -20px;
          content: " ";
          display: block;
          height: 20px;
          left: 0;
          position: absolute;
          width: 100%;
        }

        /* CSS Triangles - see Trevor's post */
        :scope .selectAll .tooltip:after {
            border-left: solid transparent 10px;
            border-right: solid transparent 10px;
            border-bottom: solid #697A91 10px;
            top: -10px;
            content: " ";
            height: 0;
            left: 90%;
            margin-left: -13px;
            position: absolute;
            width: 0;
        }

        :scope .selectAll:hover .tooltip {
          opacity: 1;
          pointer-events: auto;
          -webkit-transform: translateY(0px);
             -moz-transform: translateY(0px);
              -ms-transform: translateY(0px);
               -o-transform: translateY(0px);
                  transform: translateY(0px);
        }

        /* IE can just show/hide with no transition */
        /*.lte8 .wrapper .tooltip {
          display: none;
        }

        .lte8 .wrapper:hover .tooltip {
          display: block;
        }*/

    </style>
</media-bulk-actions>
