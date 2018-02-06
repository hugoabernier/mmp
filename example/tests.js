describe("Tests", function () {

    chai.should();

    describe("§ testMap.new()", function () {
        it("Should create a new mind map without errors", function () {
            testMap.new.should.to.not.throw(Error);
        });

        it("Should exist the svg node in the DOM", function () {
            let svg = document.querySelector("#mmp2 > svg");
            svg.should.to.not.be.null;
        });

        it("Should exist the root node in the DOM", function () {
            let node = document.getElementById("mmp2_node_0");
            node.should.to.exist;
        });
    });

    describe("§ testMap.options()", function () {
        it("Should get mind map options without errors", function () {
            testMap.options.should.to.not.throw(Error);
        });

        it("Should change some mind map options", function () {
            testMap.options({
                drag: false,
                zoom: false,
                rootNode: {
                    name: "Hello world"
                }
            });

            testMap.new();

            let node = document.getElementById("mmp2_node_0"),
                text = node.childNodes[1].childNodes[0];

            text.innerHTML.should.to.equal("Hello world");
            testMap.options().rootNode.name.should.to.equal("Hello world");
        });
    });

    describe("§ testMap.zoomIn()", function () {
        it("Should zoom-in the mind map without errors", function () {
            testMap.zoomOut.should.to.not.throw(Error);
        });
    });

    describe("§ testMap.zoomOut()", function () {
        it("Should zoom-out the mind map without errors", function () {
            testMap.zoomIn.should.to.not.throw(Error);
        });
    });

    describe("§ testMap.center()", function () {
        it("Should center the mind map without errors", function () {
            testMap.center.should.to.not.throw(Error);
        });
    });

    describe("§ testMap.undo()", function () {
        it("Should undo the mind map without errors", function () {
            testMap.undo.should.to.not.throw(Error);
        });
    });

    describe("§ testMap.redo()", function () {
        it("Should repeat the mind map without errors", function () {
            testMap.redo.should.to.not.throw(Error);
        });
    });

    describe("§ testMap.addNode()", function () {
        it("Should add a node without errors", function () {
            testMap.addNode.should.to.not.throw(Error);
        });

        it("Should exist in the DOM", function () {
            let node = document.getElementById("mmp2_node_1");
            node.should.to.exist;
        });

        it("Should add a node with custom parameters", function () {
            testMap.addNode({
                name: "Custom node",
                backgroundColor: "#c9dfc0",
                image: {
                    src: "https://raw.githubusercontent.com/Mindmapp/mindmapp/master/src/assets/icon/png/64x64.png"
                }
            });

            let node = document.getElementById("mmp2_node_2"),
                background = node.childNodes[0],
                text = node.childNodes[1].childNodes[0],
                image = node.childNodes[2];

            background.style["fill"].should.to.equal("rgb(201, 223, 192)");
            text.innerHTML.should.to.equal("Custom node");
            image.should.to.exist;
        });
    });

    describe("§ testMap.selectNode()", function () {
        it("Should get selection of a node without errors", function () {
            testMap.selectNode.should.to.not.throw(Error);
        });

        it("Should select a node", function () {
            testMap.selectNode("mmp2_node_1");

            testMap.selectNode().should.to.have.property("id").and.equal("mmp2_node_1");
        });
    });

    describe("§ testMap.removeNode()", function () {
        it("Should remove a node without errors", function () {
            testMap.selectNode("mmp2_node_2");

            testMap.removeNode.should.to.not.throw(Error);
        });
    });

    // describe("§ mmp.node.moveTo()", function () {
    //     it("Should move a node", function () {
    //         let x = mmp.node.select().value.x;
    //         mmp.node.moveTo("right", 100);
    //         mmp.node.select().value.x
    //             .should.to.equal(x + 100);
    //         mmp.node.moveTo("left", 100);
    //         mmp.node.select().value.x
    //             .should.to.equal(x);
    //     });
    // });
    //
    // describe("§ mmp.node.selectTo()", function () {
    //     it("Should move the selection of a node", function () {
    //         let key = mmp.node.select().key;
    //         mmp.node.selectTo("left");
    //         mmp.node.select().key
    //             .should.to.equal("node1");
    //         mmp.node.selectTo("right");
    //         mmp.node.select().key
    //             .should.to.equal("node0");
    //     });
    // });

    describe("§ testMap.updateNode()", function () {
        it("Should update the properties of a node ( visual )", function () {
            let color = testMap.selectNode("mmp2_node_0").textColor;

            testMap.updateNode("textColor", "#000000", true);
            testMap.selectNode().textColor.should.to.equal(color);
        });

        it("Should update the properties of a node", function () {
            testMap.updateNode("textColor", "#000000");
            testMap.selectNode().textColor.should.to.equal("#000000");
        });
    });

    describe("§ testMap.data()", function () {
        it("Should get mind map data without errors", function () {
            testMap.data.should.to.not.throw(Error);
        });

        it("Should have at least the first node", function () {
            let data = testMap.data();

            data[0].should.to.have.property("id").and.equal("mmp2_node_0");
        });
    });

    after(function () {
        // Remove links from suites for separate tests
        let links = document.querySelectorAll(".suite > h1 > a");

        links.forEach(function (a) {
            let text = a.innerHTML, parent = a.parentNode;
            parent.removeChild(a);
            parent.innerHTML = text;
        });

        // Refresh the map
        testMap.new();
    });

});
