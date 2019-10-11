let colors = ['#002E2E', '#00A3A3', '#C7AE83'];

let lineChartData = {
    labels: [],
    datasets: []
};

let config = {
    data: lineChartData,
    options: {
        responsive: true,
        hoverMode: 'index',
        stacked: false,
        title: {
            display: true,
            text: 'EUR Currency Pairs and Exchange Rates'
        },
        scales: {
            yAxes: [],
        }
    }
}

let multiArrow =
    '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" ' +
    '	 viewBox="0 0 30.8 30.8" style="enable-background:new 0 0 30.8 30.8;" xml:space="preserve"> ' +
    '<style type="text/css"> ' +
    '	.st0{fill:none;stroke:#DDDDDD;stroke-miterlimit:10;} ' +
    '	.st1{fill-rule:evenodd;clip-rule:evenodd;fill:#DDDDDD;} ' +
    '	.st2{fill-rule:evenodd;clip-rule:evenodd;fill:#DDDDDD;stroke:#DDDDDD;stroke-miterlimit:10;} ' +
    '</style> ' +
    '<g> ' +
    '	<g> ' +
    '		<g> ' +
    '			<line class="st0" x1="7.1" y1="7.5" x2="23.6" y2="23.3"/> ' +
    '			<line class="st1" x1="7.1" y1="7.5" x2="23.6" y2="23.3"/> ' +
    '		</g> ' +
    '		<polygon class="st2" points="7.2,7.5 5.9,8.7 5.5,7 5.1,5.4 6.7,5.8 8.4,6.3 		"/> ' +
    '		<polygon class="st2" points="25.3,23.7 25.7,25.4 24,24.9 22.4,24.5 23.6,23.3 24.8,22 		"/> ' +
    '	</g> ' +
    '	<g> ' +
    '		<g> ' +
    '			<line class="st0" x1="7.5" y1="23.6" x2="23.3" y2="7.2"/> ' +
    '			<line class="st1" x1="7.5" y1="23.6" x2="23.3" y2="7.2"/> ' +
    '		</g> ' +
    '		<polygon class="st2" points="7.5,23.6 8.7,24.8 7,25.3 5.4,25.7 5.8,24 6.3,22.4 		"/> ' +
    '		<polygon class="st2" points="23.7,5.5 25.4,5.1 24.9,6.7 24.5,8.4 23.3,7.2 22,5.9 		"/> ' +
    '	</g> ' +
    '</g> ' +
    '</svg> '


const distinct = (acc, current) => acc.indexOf(current) === -1 ? [...acc, current] : acc;

window.onload = async () => {

    let data = await fetch('/data');
    data = await data.json();

    const dates = data.map(e => e.time_created)
        .reduce(distinct, []);

    const currencyPairs = data.map(e => e.name)
        .reduce(distinct, []);

    lineChartData.labels = dates.map(e => e.slice(0, 10));
    lineChartData.datasets = currencyPairs.map((pair, i) => {
        return {
            label: pair,
            borderColor: colors[i],
            backgroundColor: colors[i],
            fill: false,
            data: dates.map(date => data.find(e => e.name === pair && e.time_created === date).rate),
        }
    })


    config.options.scales.yAxes = [{
        type: 'linear',
        display: true,
        position: 'right',
    }]

    const canvas = document.createElement('div');
    canvas.setAttribute('id', 'widget');
    let styles = {
        minWidth: '500px',
        minHeight: '260px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '5px',
        position: 'absolute',
        height: window.localStorage.getItem('widget-height') || '260px',
        width: window.localStorage.getItem('widget-width') || '500px',
        left: window.localStorage.getItem('widget-left') || 0,
        top: window.localStorage.getItem('widget-top') || 0,
        maxWidth: '90%',
        maxHeight: '45vw',

    };

    Object.keys(styles).map(key => canvas.style[key] = styles[key]);

    canvas.innerHTML = `<div id="handle" style="position: absolute; width: 22px;">${multiArrow}</div><canvas id="canvas" style="cursor: auto"></canvas>`;
    document.body.appendChild(canvas);


    const ctx = document.getElementById('canvas').getContext('2d');
    window.myLine = Chart.Line(ctx, config);

    dragElement(canvas, document.getElementById('handle'));
    resizeElement(canvas);

};

function resizeElement(element) {
    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    resizer.style.width = '10px';
    resizer.style.height = '10px';
    resizer.style.position = 'absolute';
    resizer.style.right = 0;
    resizer.style.bottom = 0;
    resizer.style.cursor = 'se-resize';
    element.appendChild(resizer);
    resizer.addEventListener('mousedown', initResize, false);

    function initResize(e) {
        window.addEventListener('mousemove', Resize, false);
        window.addEventListener('mouseup', stopResize, false);
    }
    function Resize(e) {
        element.style.width = (e.clientX - element.offsetLeft) + 'px';
        element.style.height = (e.clientX - element.offsetLeft) / 1.9 + 'px';
        window.localStorage.setItem('widget-width', element.offsetWidth + 'px');
        window.localStorage.setItem('widget-height', element.offsetHeight + 'px');
    }
    function stopResize(e) {
        window.removeEventListener('mousemove', Resize, false);
        window.removeEventListener('mouseup', stopResize, false);
    }
}




function dragElement(elmnt, draggingSpot) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    draggingSpot.style.cursor = 'grab';
    draggingSpot.onmousedown = dragMouseDown;


    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        draggingSpot.style.cursor = 'grabbing';
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        (window.innerHeight - elmnt.offsetHeight - 5 > (elmnt.offsetTop - pos2) && (elmnt.offsetTop - pos2) > 5) 
        && (elmnt.style.top = (elmnt.offsetTop - pos2) + "px");
        (window.innerWidth - elmnt.offsetWidth - 5 > (elmnt.offsetLeft - pos1) && (elmnt.offsetLeft - pos1) > 5) 
        && (elmnt.style.left = (elmnt.offsetLeft - pos1) + "px");
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        draggingSpot.style.cursor = 'grab';
        window.localStorage.setItem('widget-top', elmnt.style.top);
        window.localStorage.setItem('widget-left', elmnt.style.left);
    }
}
