//r-donat-chart.js////
function rDonatChart(config) {
    var a = {
        clear: function () { this.state.ctx.clearRect(0, 0, this.state.size, this.state.size); },
        drawArc: function (obj) {
            var ctx = a.state.ctx;
            ctx.save();
            ctx.beginPath();
            if (obj.dashed) {
                ctx.setLineDash(obj.dashed);
            }
            ctx.arc(obj.x, obj.y, obj.r, obj.start, obj.end); ctx.lineWidth = obj.thickness; ctx.strokeStyle = obj.color; ctx.stroke(); ctx.closePath(); ctx.restore();
        },
        drawEmpty: function () {
            var s = this.state, r = s.size / 2;
            this.drawArc({ x: r, y: r, r: r - s.thickness / 2, start: 0, end: 360, thickness: s.thickness, color: s.emptyColor,dashed:this.state.dashed });
        },
        drawFill: function () { var s = this.state, r = s.size / 2, angle = this.getAngle(s.value); this.drawArc({ x: r, y: r, r: r - s.thickness / 2, start: angle, end: 0, thickness: s.thickness, color: s.fillColor }); },
        getAngle: function (value) { var s = this.state; if (value === s.start) { value = s.end; } else if (value === s.end) { value = s.start; } var angle = 360 * (value - s.start) / (s.end - s.start); return (360 - angle) * Math.PI / 180; },
        state: { start: 0, end: 100, emptyColor: "#eee", fillColor: "#000", thickness: 5, unit:""},
        interval: null,
        ////////////////////////////////////////////////////
        init: function (config) {
            this.updateState(config);
            var container = $(this.state.container),
            size = this.state.size = Math.min(container.width(), container.height());
            container.html(CanvasChart({ size: size }));
            this.state.ctx = container.find("canvas")[0].getContext("2d");
            this.update({ value: this.state.value, text: this.state.text });
        },
        updateState: function (obj) {
            for (var prop in obj) {this.state[prop] = obj[prop];}
            if (this.state.value === undefined || this.state.value < this.state.start) { this.state.value = this.state.start; }
            else if (this.state.value > this.state.end) { this.state.value = this.state.end; }
            this.state.speed = Math.pow((this.state.end - this.state.start) / 1600, -1);
        },
        setText: function () {$(this.state.container).find("div").html(this.state.text || this.state.value + this.state.unit);},
        update: function (obj) {
            a.updateState(obj);
            a.currentValue = a.currentValue === undefined ? a.state.start : a.currentValue;
            clearInterval(a.interval);
            var value = a.state.value;
            sign = Math.sign(value - a.currentValue);
            a.interval = setInterval(function () {
                if (a.currentValue > value && sign > 0) {
                    clearInterval(a.interval);
                    return;
                }
                if (a.currentValue < value && sign < 0) {
                    clearInterval(a.interval);
                    return;
                }
                a.state.value = a.currentValue;
                a.redraw();
                a.currentValue += sign;
            }, a.state.speed);
        },
        redraw: function (value) {
            this.clear();
            this.drawEmpty();
            this.drawFill();
            this.setText();
        }
    };
    a.init(config);
    return {update: a.update};
}
function CanvasChart(props) {
    var size = props.size;
    function getStyle() {
        var str = '';
        str += 'overflow:hidden;position:absolute;width:100%;height:100%;left:0;top:0;';
        str += 'text-align:center;line-height:' + size + 'px;';
        return str;
    }
    var str = '<canvas width="' + size + '" height="' + size + '" style="' + getStyle() + '"></canvas>';
    str += '<div style="' + getStyle() + '"></div>';
    return str;
}