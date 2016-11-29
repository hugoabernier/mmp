/**
 * @name mmap
 * @version 0.0.1
 * @author Omar Desogus
 * @license GNU GENERAL PUBLIC LICENSE
 *
 */
(function( window, d3 ) {

    /**
     * @name global
     * @description
     * Global dictionary that will contain all the properties of the
     * map shared by all functions within the module.
     *
     */
    const global = {};

    /**
     * @name init
     * @description
     * ...
     *
     * @param {string} selector The selector in which to draw
     */
    function init( selector ) {

        const frame = d3.select( selector );

        const g = frame.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .append('g').call( zoom );

        g.append("rect")
            .attr("width", '100%')
            .attr("height", '100%')
            .attr("fill", "transparent")
            .attr("pointer-events", "all")
            .on('mousedown', deselectNode );

        // Set global variables
        global.svg = { main : g, mmap : g.append('g') };
        global.counter = 0;
        global.nodes = d3.map();

        global.nodes.set('node' + global.counter, {
            x : parseInt( frame.style('width') )/2,
            y : parseInt( frame.style('height') )/2,
            background : '#e6e6e6', textColor : '#828c82',
            font : 18, name : 'Root node'
        });

        global.selected = 'node0';
        update();
    }

    /****** Utils functions  ******/

    const zoom = d3.zoom().scaleExtent([0.5, 2]).on('zoom', zoomed );

    const drag = d3.drag().on('drag', dragged ).on('start', dragStarted );

    function zoomed() {
        global.svg.mmap.attr('transform', d3.event.transform.toString() );
    }

    function dragStarted(n) {
        d3.selectAll('.node > ellipse').attr('stroke', 'none');
        d3.select(this).selectAll('ellipse').attr('stroke', '#888888');
        global.selected = n.key;
    }

    function dragged(n) {
        const x = n.x = d3.event.x;
        const y = n.y = d3.event.y;
        d3.select(this).attr('transform','translate('+ x +','+ y +')');
        d3.selectAll('.link').attr('d', n => diagonal( n ) );
    }

    function deselectNode() {
        d3.selectAll('.node > ellipse').attr('stroke', 'none');
        global.selected = 'node0';
    }

    function nodeLevel( n ) {
        var p = n.parent, level = 0;
        while ( p ) {
            level++;
            p = p.parent;
        }
        return level < 5 ? level : 5;
    }

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal( n ) {

        const width = 30 - nodeLevel( n ) * 5;
        const orY = n.parent.y < n.y ? -1 : 1;
        const orX = n.parent.x > n.x ? -1 : 1;
        const middleX = ( n.parent.x + n.x ) / 2;
        const k = n.k = n.k || d3.randomUniform(50)();

        const path = d3.path();
        path.moveTo( n.parent.x, n.parent.y - width/2 );
        path.bezierCurveTo(
            middleX, n.parent.y - width/2,
            n.parent.x + k*orX, n.y + n.height/2 + 5 + k/10,
            n.x - ( n.width/4 - k/2 )*orX, n.y + n.height/2 + 5 + k/10
        );
        path.bezierCurveTo(
            n.parent.x + k*orX + width/2*orY*orX, n.y + n.height/2 + width/2 + 5 + k/10,
            middleX + width/2*orY*orX, n.parent.y + width/2,
            n.parent.x, n.parent.y + width/2
        );
        path.closePath();

        return path;
    }

    function getNodesWithKeys() {
        const nodesWithKeys = [];
        global.nodes.each( function( n, k ) {
            n.key = k;
            nodesWithKeys.push( n );
        });
        return nodesWithKeys;
    }

    function openTextEditor( n ) {
        const self = this;

        const input = document.createElement("input");
        input.type = "text";
        input.style = `
            position: absolute;
            top: ${ d3.event.y - 70 }px;
            left: ${ d3.event.x - 40 }px;
            padding: 5px;
            background-color: transparent
        `;
        input.value = this.childNodes[1].innerHTML;
        document.body.appendChild( input ).focus();
        input.onblur = function() {
            input.remove();
        }
        input.onkeyup = function( e ) {
            if( e.key === "Enter" ) {
                input.blur();
            } else {
                const text = self.childNodes[1];
                const ellipse = self.childNodes[0];

                n.name = text.innerHTML = input.value;
                n.width = text.textLength.baseVal.value + 40;

                ellipse.setAttribute('rx', n.width/2 );
                ellipse.setAttribute('ry', n.height/2 );
            }
        };

        d3.event.stopPropagation();
    }

    function update() {

        const nodes = getNodesWithKeys();

        const node = global.svg.mmap.selectAll('.node').data( nodes );

        const nodeContainer = node.enter().append('g')
            .attr('class', 'node')
            .attr('transform', n => 'translate(' + n.x + ',' + n.y + ')')
            .call( drag )
            .on("dblclick.zoom", null)
            .on('dblclick', openTextEditor );

        nodeContainer.append('text').text( n => n.name )
            .attr('fill', n => n.textColor )
            .attr('font-size', n => n.font )
            .attr('dy', 5 );

        nodeContainer.append('ellipse')
            .style('fill', n => n.background )
            .attr('rx', function( n ) {
                n.width = this.previousSibling.getBBox().width + 40;
                return n.width/2;
            }).attr('ry', function( n ) {
                n.height = this.previousSibling.getBBox().height + 20;
                return n.height/2;
            });

        node.exit().remove();

        const link = global.svg.mmap.selectAll('.link').data( nodes.slice(1) );

        link.enter().insert('path', 'g')
            .attr('class', 'link')
            .style('fill', n => n.linkColor )
            .style('stroke', n => n.linkColor )
            .attr('d', n => diagonal( n ) );

        link.exit().remove();

        d3.selectAll('.node > text').each( function() {
            this.parentNode.appendChild(this);
        });
    }

    function redraw() {
        d3.selectAll('.node, .link').remove();
        update();
    }

    function selected() {
        return global.nodes.get( global.selected );
    }

    /****** Public functions ******/

    function addNode( prop ) {
        if( global.selected ) {
            const sel = global.nodes.get( global.selected );
            const root = global.nodes.get('node0');
            global.nodes.set('node' + ( ++global.counter ), {
                parent : sel,
                x : sel.x + ( sel.x > root.x ? 200 : -200 ),
                y : sel.y + 50,
                background : prop && prop.background || '#f1f1f1',
                textColor : prop && prop.textColor || '#9a9a9a',
                linkColor : prop && prop.linkColor || '#9fad9c',
                font : prop && prop.font || 15,
                name : prop && prop.name || 'Node'
            });
            update();
        }
    }

    function removeNode() {
        if( global.selected !== 'node0' ) {
            global.nodes.remove( global.selected );

            const clean = function( key ) {
                global.nodes.each( function( n ) {
                    if ( n.key !== 'node0' && n.parent.key === key ) {
                        global.nodes.remove( n.key );
                        clean( n.key );
                        return;
                    }
                });
            }
            clean( global.selected );

            global.selected = 'node0';
            redraw();
        }
    }

    function center() {
        global.svg.main.transition().duration(500).call( zoom.transform, d3.zoomIdentity );
    }

    function updateNode( k, v ) {
        const sel = global.nodes.get( global.selected );
        if( k in sel ) {
            sel[k] = v;
            redraw();
        }
    }

    /**
     * @description
     * Make visible public functions outside
     *
     */
    window.mmap = {
        // Basic
        init : init,
        center : center,
        addNode : addNode,
        removeNode : removeNode,

        // Advanced
        updateNode : updateNode,
    };

}(this, window.d3));
