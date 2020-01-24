<z-datepicker>

  { opts.months}

  <div class="container { open: opened }">
    <input
      type="text"
      onclick="{ show }"
      value="{ date.format(opts.format || 'LL') }"
      readonly>

    <div class="calendar" show="{ opened }">
      <div class="grid grid-row" if="{ opts.years != 'false' }">
        <div class="selector" onclick="{ prevYear }">&lsaquo;</div>
        <span class="year">{ date.format('YYYY') }</span>
        <div class="selector" onclick="{ nextYear }">&rsaquo;</div>
      </div>
      <div class="grid grid-row" if="{ opts.years == 'false' }">
        <span class="year fill">{ date.format('YYYY') }</span>
      </div>

      <div class="grid grid-row" if="{ opts.months != 'false' }">
        <div class="selector" onclick="{ prevMonth }">&lsaquo;</div>
        <span class="month">{ date.format('MMMM') }</span>
        <div class="selector" onclick="{ nextMonth }">&rsaquo;</div>
      </div>
      <div class="grid grid-row" if="{ opts.months == 'false' }">
        <span class="month fill">{ date.format('MMMM') }</span>
      </div>

      <div class="grid grid-row">
        <span class="day-name" each="{ day in dayNames }">{ day }</span>
      </div>
      <div class="grid grid-wrap">
        <div each="{ day in days }"
              onclick="{ this.parent.changeDate }"
              class="date {
              in: day.inMonth,
              selected: day.selected,
              today: day.today
            }">
          { day.date.format('DD') }
        </div>
      </div>

      <div class="grid grid-row">
        <rg-timepicker class="timepicker"
            onselect="{}"
            placeholder="{}"
            time="{}"
            step="{}"
            max="{}"
            ampm="{}">
        </rg-timepicker>
        <rg-select class="timezone"
            onselect="{}"
            placeholder="{}"
            filter-placeholder="Filter Timezone"
            options="{[]}"
            prefix="{}">
        </rg-select>
      </div>

      <div class="grid grid-row">
        <a class="shortcut" onclick="{ setToday }">Today</a>
      </div>
    </div>
  </div>

  <script type="es6">
    // this.date = moment(opts.date)

    // var handleClickOutside = e => {
    //   if (!this.root.contains(e.target) && this.opened) {
    //     if (opts.onclose) opts.onclose(this.date)
    //     this.opened = false
    //     this.update()
    //   }
    // }

    // var buildCalendar = () => {
    //   var cursor = moment(this.date)
    //   var end = moment(cursor)

    //   // Set cursor to start of the month and start of the week
    //   cursor.startOf('month')
    //   cursor.day(0)
    //   // end of month and end of week
    //   end.endOf('month')
    //   end.day(6)

    //   this.dayNames = []
    //   this.days = []

    //   while (cursor.isBefore(end)) {
    //     if (this.dayNames.length < 7) this.dayNames.push(cursor.format('dd'))

    //     this.days.push({
    //       date: moment(cursor),
    //       selected: this.date.isSame(cursor, 'day'),
    //       today: moment().isSame(cursor, 'day'),
    //       inMonth: this.date.isSame(cursor, 'month')
    //     })

    //     cursor = cursor.add(1, 'days')
    //   }
    //   this.opts.date = this.date.toDate()
    //   this.update()
    // }

    // this.on('mount', () => {
    //   document.addEventListener('click', handleClickOutside)
    // })

    // this.on('unmount', () => {
    //   document.removeEventListener('click', handleClickOutside)
    // })

    // // Handle the clicks on dates
    // this.changeDate = e => {
    //   this.date = e.item.day.date
    //   if (opts.onselect) opts.onselect(this.date)
    //   buildCalendar()
    // }

    // // Handle today shortcur
    // this.setToday = () => {
    //   this.date = opts.date = moment()
    //   if (opts.onselect) opts.onselect(this.date)
    //   buildCalendar()
    // }

    // // Handle the previous year change
    // this.prevYear = () => {
    //   this.date.subtract(1, 'year')
    //   buildCalendar()
    // }

    // // Handle the next month change
    // this.nextYear = () => {
    //   this.date.add(1, 'year')
    //   buildCalendar()
    // }

    // // Handle the previous month change
    // this.prevMonth = () => {
    //   this.date.subtract(1, 'month')
    //   buildCalendar()
    // }

    // // Handle the next month change
    // this.nextMonth = () => {
    //   this.date.add(1, 'month')
    //   buildCalendar()
    // }

    // // Show/hide the datepicker
    // this.show = () => {
    //   if (opts.onopen) opts.onopen()
    //   buildCalendar()
    //   this.opened = true
    // }
  </script>

  <style scoped>

    .container {
      position: relative;
      display: inline-block;
      cursor: pointer;
    }

    input {
      font-size: 1em;
      padding: 10px;
      border: 1px solid #D3D3D3;
      cursor: pointer;
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
      outline: none;
    }

    .calendar {
      position: absolute;
      text-align: center;
      background-color: white;
      border: 1px solid #D3D3D3;
      padding: 5px;
      width: 330px;
      margin-top: 10px;
      left: 50%;
      -webkit-transform: translateX(-50%);
      -moz-transform: translateX(-50%);
      -ms-transform: translateX(-50%);
      -o-transform: translateX(-50%);
      transform: translateX(-50%);
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
      -webkit-box-shadow: 0 2px 10px -4px #444;
      -moz-box-shadow: 0 2px 10px -4px #444;
      box-shadow: 0 2px 10px -4px #444;
    }

    .grid {
      display: -webkit-flex;
      display: -ms-flexbox;
      display: flex;
      -webkit-align-items: center;
      -ms-flex-align: center;
      align-items: center;
    }

    .grid-wrap {
      width: 100%;
      -webkit-flex-wrap: wrap;
      -ms-flex-wrap: wrap;
      flex-wrap: wrap;
    }

    .grid-row {
      height: 35px;
    }

    .selector {
      font-size: 2em;
      font-weight: 100;
      padding: 0;
      -webkit-flex: 0 0 15%;
      -ms-flex: 0 0 15%;
      flex: 0 0 15%;
    }

    .year, .month {
      text-transform: uppercase;
      font-weight: normal;
      -webkit-flex: 0 0 70%;
      -ms-flex: 0 0 70%;
      flex: 0 0 70%;
    }

    .fill {
      -webkit-flex: 0 0 100%;
      -ms-flex: 0 0 100%;
      flex: 0 0 100%;
    }

    .day-name {
      font-weight: bold;
      -webkit-flex: 0 0 14.28%;
      -ms-flex: 0 0 14.28%;
      flex: 0 0 14.28%;
    }

    .date {
      -webkit-flex: 0 0 14.28%;
      -ms-flex: 0 0 14.28%;
      flex: 0 0 14.28%;
      padding: 10px;
      border-radius: 100%;
      box-sizing: border-box;
      font-size: 0.8em;
      font-weight: normal;
      border: 2px solid transparent;
      color: #cacaca;
    }

    .date:hover {
      background-color: #f3f3f3;
    }

    .date.in {
      color: inherit;
    }

    .today {
      border-color: #ededed;
    }

    .selected, .selected:hover {
      background-color: #ededed;
      border-color: #dedede;
    }

    .shortcut {
      -webkit-flex: 0 0 100%;
      -ms-flex: 0 0 100%;
      flex: 0 0 100%;
      color: #6495ed;
    }
  </style>

</z-datepicker>
