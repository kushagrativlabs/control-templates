class DragTarget {
    constructor(wrapper, imgUrl, enableEditing = true, height = 0, config = null, add_btn = true) {
        this.dragCounter= 0;
        this.singleMatchInput = document.getElementById('singleDrop');
        this.isOneToOne = true;
        this.targetCounter= 0;
        this.isPlaceHolder = true;
        this.fileInput = null;
        this.width = 0;
        this.height = height;
        this.wrapper = wrapper;
        this.mainImage = new Image();
        this.mainImage.src = imgUrl;
        if (enableEditing) {
            this.isSelecting = false;
            this.currentSnip = null;
            this.isSnipEnabled = false;
            this.snipType = null;
            this.snipId = "";
            this.isCreatingSnip = false;
            this.initMouseEvents();
            this.isButtonClicked = false;
        }
        this.add_btn = add_btn;
        this.configs = config;
        this.mainImage.onload = () => this.init();
        
    }

    static importConfig(wrapper, configs) {
        return new DragTarget(wrapper, configs.wrapper_config.backgroundImage, true, configs.wrapper_config.height, config, false);
    }

    init() {
        this.setMainImage();
        if (this.configs != null) {
            this.handleConfigs(this.configs);
        }

        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*"; // Only accept image files
        fileInput.style.display = "none";

        this.fileInput = fileInput;


        this.wrapper.appendChild(fileInput);

        this.initPlaceHolderEvents();
    
    }

    setMainImage() {
        const parentWidth = this.wrapper.parentElement.clientWidth; // Get parent width
        const imgWidth = this.mainImage.width;
        const imgHeight = this.mainImage.height;

        // Calculate height based on aspect ratio
        this.width = parentWidth;
        this.height = (imgHeight / imgWidth) * this.width;

        this.wrapper.style.backgroundImage = `url(${this.mainImage.src})`;
        this.wrapper.style.backgroundSize = 'cover';
        this.wrapper.style.backgroundRepeat = 'no-repeat';
        this.wrapper.style.position = 'relative';
        this.wrapper.style.width = `${this.width}px`;
        this.wrapper.style.height = `${this.height}px`;
    }

    handleConfigs(configs) {
        for (const config of configs.drag_configs) {
            this.addConfigSnap(config, true);
            this.dragCounter++;
        }

        for (const config of configs.target_configs) {
            this.targetCounter++;
            this.addConfigSnap(config, false);
        }
    }

    addConfigSnap(config, makeDraggable = false) {
        const snip = document.createElement('div');
        snip.classList.add("snip");
        snip.classList.add(config.classList.replace('snip', "").replace("selected","").trim());
        snip.style.position = config.style_position;
        snip.style.left = config.style_left;
        snip.style.top = config.style_top;
        snip.style.border = config.style_border;
        snip.id = config.id;
        snip.style.height = config.style_height;
        snip.style.width = config.style_width;
        this.wrapper.appendChild(snip);

        if (makeDraggable) {
            snip.style.backgroundImage = `url(${this.mainImage.src})`;
            snip.style.backgroundSize = config.backgroundSize;
            snip.style.backgroundPosition = config.backgroundPosition;
            this.makeDraggable(snip)
        } else {
            this.enableTargetSnip(snip);
        }

        if (this.add_btn) {
            snip.appendChild(this.getDeleteButton());
        }

    }


    getDeleteButton() {
        const deleteBtn = Object.assign(document.createElement('button'), {
            innerText: '×',
            className: 'delete-btn'
        });
        return deleteBtn;
    }
    

    initMouseEvents() {
        this.wrapper.addEventListener('mousedown', (e) => this.startSelection(e));
        this.wrapper.addEventListener('mousemove', (e) => this.updateSelection(e));
        document.addEventListener('mouseup', (e) => this.endSelection(e));  // Ensure mouseup is global
        this.initCommonEvents();
        this.initJquery()
    }
    initJquery() {
        const self = this;
        let movementSpeed = 5;
        let interval;
        let keys = {};
        let isResizing = false;
        let deleteItem = null;
    
        jQuery(document).ready(function ($) {
            $(document).on('click', '.snip', function () {
                const isSelected = $(this).hasClass('selected');
                $('.snip').removeClass('selected');
                $('.resize-handle').remove(); // Remove old handles
    
                if (!isSelected) {
                    $(this).addClass('selected');
                    addResizeHandle($(this)); // Add resize handle
                }
            });
    
            $(document).keydown(function (e) {
                if ([37, 38, 39, 40].includes(e.which)) e.preventDefault();
    
                if (!keys[e.which]) {
                    keys[e.which] = true;
                    if (!interval) interval = setInterval(moveElement, 50);
                }
            });
    
            $(document).keyup(function (e) {
                delete keys[e.which];
                if ($.isEmptyObject(keys)) {
                    clearInterval(interval);
                    interval = null;
                }
            });
    
            function moveElement() {
                let $el = $('.snip.selected');
                if (!$el.length || isResizing) return;
    
                let $parent = $el.parent();
                let pos = $el.position();
                let parentWidth = $parent.width();
                let parentHeight = $parent.height();
                let elWidth = $el.outerWidth();
                let elHeight = $el.outerHeight();
    
                if (keys[37] && pos.left > 0) $el.css('left', Math.max(0, pos.left - movementSpeed) + 'px');
                if (keys[38] && pos.top > 0) $el.css('top', Math.max(0, pos.top - movementSpeed) + 'px');
                if (keys[39] && pos.left + elWidth < parentWidth) 
                    $el.css('left', Math.min(parentWidth - elWidth, pos.left + movementSpeed) + 'px');
                if (keys[40] && pos.top + elHeight < parentHeight) 
                    $el.css('top', Math.min(parentHeight - elHeight, pos.top + movementSpeed) + 'px');
    
                self.updateBackgroundImage($el.get(0));
            }
    
            function addResizeHandle($el) {
                const handle = $('<div class="resize-handle"></div>');
                $el.append(handle);
    
                handle.on('mousedown', function (e) {
                    e.preventDefault();
                    isResizing = true;
    
                    $(document).on('mousemove', resizeElement);
                    $(document).on('mouseup', stopResizing);
                });
            }
    
            function resizeElement(e) {
                if (!isResizing) return;
                let $el = $('.snip.selected');
                let $parent = $el.parent();
                let parentWidth = $parent.width();
                let parentHeight = $parent.height();
                
                let newWidth = Math.min(parentWidth - $el.position().left, e.pageX - $el.offset().left);
                let newHeight = Math.min(parentHeight - $el.position().top, e.pageY - $el.offset().top);
    
                $el.css({
                    width: Math.max(20, newWidth) + 'px',
                    height: Math.max(20, newHeight) + 'px'
                });
            }
    
            function stopResizing() {
                isResizing = false;
                $(document).off('mousemove', resizeElement);
                $(document).off('mouseup', stopResizing);
            }

            $(document).on('click','.delete-btn',function(e){
                e.preventDefault();
                deleteItem = $(this).parent();
                $('#deleteModal').modal('show');
            });

            $(document).on('click','#confirmDelete',function(e){
                if(deleteItem!=null){
                    deleteItem.remove();
                }
                $('#deleteModal').modal('hide');
                self.resetSnipCreation();
            });
        });
    }
    

    initPlaceHolderEvents() {
        const self = this;  // Store reference to `this`

        this.wrapper.addEventListener('click', function () {
            if (self.isPlaceHolder) {
                self.fileInput.click();

            }
        });

        this.fileInput.addEventListener('change', function () {
            if (self.fileInput.files && self.fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const img = new Image();
                    img.src = e.target.result;
                    self.mainImage = img;
                    img.onload = (e) => {
                        self.setMainImage();
                    }
                    self.isPlaceHolder = false;
                };

                reader.readAsDataURL(self.fileInput.files[0]);
            }
        });
    }

    initCommonEvents() {
        const self = this;

        let importInput = document.createElement('input');
        importInput.type = 'file';
        importInput.id = 'jsonFileInput';
        importInput.accept = '.json';
        importInput.style.display = "none";
        this.wrapper.appendChild(importInput);

        importInput.addEventListener('change', function (event) {
            let file = event.target.files[0];

            if (!file) return; // If no file is selected

            if (file.type !== "application/json" && !file.name.endsWith('.json')) {
                alert("Please upload a valid JSON file.");
                return;
            }

            let reader = new FileReader();
            reader.onload = function (e) {
                try {
                    
                    let jsonData = JSON.parse(e.target.result); // Parse JSON
                    console.log(e.target.result);
                    self.configs = jsonData;
                    self.enableEditing = true;
                
                        const img = new Image();
                        img.src = jsonData.wrapper_config.backgroundImage;
                        img.height = parseInt(jsonData.wrapper_config.height.replace("px",""));
                        img.width =  parseInt(jsonData.wrapper_config.width.replace("px",""));
                        self.mainImage = img;
                        self.setMainImage();
                        self.isPlaceHolder = false;
                        self.handleConfigs(jsonData)

                    // DragTarget(wrapper, configs.wrapper_config.backgroundImage, true, configs.wrapper_config.height, config, false);
                } catch (error) {
                  console.log(error)

                }
            };
            reader.readAsText(file);
        });


        // Handle "Create Snip" Button Click
        document.getElementById('create-target').addEventListener('click', () => {
            this.enableSnipCreation('target', this.targetCounter++);
        });

        document.getElementById('create-draggable').addEventListener('click', () => {
            this.enableSnipCreation('draggable', this.dragCounter++);
        });


        document.getElementById('exportSnip').addEventListener('click', (e) => this.downloadConfigAsJSON());
        document.getElementById('importSnip').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            importInput.click(); // Trigger file input click
        });
        
        // Stop event propagation on file input
        importInput.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click event from bubbling up
        });

        self.singleMatchInput.addEventListener('change',function(e){
            self.isOneToOne = self.singleMatchInput.checked;
        })
    
    }

    exportConfigs() {
        const draggables = document.querySelectorAll('.snip');
        const drag_configs = [];
        const target_configs = [];

        for (const draggable of draggables) {
            const dragConfig = {};

            // Correctly store class names.  classList returns a DOMTokenList, not a string.  Use className.
            dragConfig.classList = draggable.className; // or draggable.classList.toString();
            dragConfig.style_position = draggable.style.position;
            dragConfig.style_left = draggable.style.left;
            dragConfig.style_top = draggable.style.top;
            dragConfig.style_border = draggable.style.border;
            dragConfig.style_height = draggable.style.height;
            dragConfig.style_width = draggable.style.width;
            dragConfig.id = draggable.id;
            if (dragConfig.classList.includes('target')) {
                target_configs.push(dragConfig)
            } else {
                const wrapperRect = this.wrapper.getBoundingClientRect();
                const left = parseFloat(draggable.style.left);
                const top = parseFloat(draggable.style.top);
                dragConfig.backgroundSize = `${wrapperRect.width}px ${wrapperRect.height}px`;
                dragConfig.backgroundPosition = `-${left}px -${top}px`;
                dragConfig.border = '1px solid black';
                drag_configs.push(dragConfig);
            }

        }
        const wrapper_config = {
            backgroundImage: this.getBase64Image(this.mainImage),  // Convert image to Base64
            backgroundSize: this.wrapper.style.backgroundSize,
            backgroundRepeat: this.wrapper.style.backgroundRepeat,
            position: this.wrapper.style.position,
            width: this.wrapper.style.width,
            height: this.wrapper.style.height,
        };
        const options =  {
            OneToOneMatching:this.isOneToOne
        }

        const allConfigs = { drag_configs, target_configs, wrapper_config ,options};
        console.log(allConfigs);
        return allConfigs; // Important: Return the array!
    }
    downloadConfigAsJSON() {
        const configData = this.exportConfigs();
        const jsonString = JSON.stringify(configData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const link = document.createElement("a");

        link.href = URL.createObjectURL(blob);
        link.download = "config.json";  // Filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    getBase64Image(img) {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL("image/png"); // Convert to Base64 PNG
    }
    startSelection(event) {
        if (this.isCreatingSnip || !this.isSnipEnabled || this.currentSnip || !this.isButtonClicked) return;

        this.isSelecting = true;
        this.isCreatingSnip = true; // Set the flag to true when snip creation starts

        const wrapperRect = this.wrapper.getBoundingClientRect();
        this.startX = event.clientX - wrapperRect.left;
        this.startY = event.clientY - wrapperRect.top;

        this.currentSnip = document.createElement('div');
        this.currentSnip.classList.add('snip');
        this.currentSnip.classList.add(this.snipType);
        this.currentSnip.style.position = 'absolute';
        this.currentSnip.style.left = `${this.startX}px`;
        this.currentSnip.style.top = `${this.startY}px`;
        this.currentSnip.style.border = this.snipType == "target" ? '1px dashed yellow' : '1px solid blue';
        this.currentSnip.id = (this.snipType == "target" ? "targ" : "drag")  + "-" + this.snipId;

        this.wrapper.appendChild(this.currentSnip);
    }

    updateSelection(event) {
        if (!this.isSelecting || !this.currentSnip) return;

        const wrapperRect = this.wrapper.getBoundingClientRect();
        let width = event.clientX - wrapperRect.left - this.startX;
        let height = event.clientY - wrapperRect.top - this.startY;

        if (width < 0) {
            this.currentSnip.style.left = `${event.clientX - wrapperRect.left}px`;
            width = Math.abs(width);
        }
        if (height < 0) {
            this.currentSnip.style.top = `${event.clientY - wrapperRect.top}px`;
            height = Math.abs(height);
        }

        this.currentSnip.style.width = `${width}px`;
        this.currentSnip.style.height = `${height}px`;
    }

    endSelection(event) {
        if (!this.isSelecting) return;
        this.isSelecting = false;

        if (this.currentSnip) {

            if (this.currentSnip.offsetWidth < 10 || this.currentSnip.offsetHeight < 10) {
                this.deleteSnip(this.currentSnip);
            } else {
               
                if (this.snipType === "draggable") {
                    this.updateBackgroundImage(this.currentSnip);
                    this.makeDraggable(this.currentSnip);
                } else {
                    this.enableTargetSnip(this.currentSnip);
                }
                if (this.add_btn) {
                    this.currentSnip.appendChild(this.getDeleteButton());
                }
            }
        }

        this.resetSnipCreation();
    }
    updateBackgroundImage(snip) {
        if (snip) {

            const wrapperRect = this.wrapper.getBoundingClientRect();
            const left = parseFloat(snip.style.left);
            const top = parseFloat(snip.style.top);
            const width = parseFloat(snip.style.width);
            const height = parseFloat(snip.style.height);

            snip.style.backgroundImage = `url(${this.mainImage.src})`;
            snip.style.backgroundSize = `${wrapperRect.width}px ${wrapperRect.height}px`;
            snip.style.backgroundPosition = `-${left+2}px -${top+2}px`;
        }

    }
    deleteSnip(snip) {
        if (snip) snip.remove();
        this.resetSnipCreation(); // Reset the flags and currentSnip
    }

    resetSnipCreation() {
        this.isButtonClicked = false;
        this.isCreatingSnip = false; // Reset the flag if snip creation is canceled
        this.currentSnip = null; // Explicitly set currentSnip to null
        this.resetCursor(); // Reset the cursor when snip is finished or deleted
    }

    enableSnipCreation(type, snipId) {
        this.snipId = snipId;
        if (this.isCreatingSnip) {
            this.resetSnipCreation(); // Reset any ongoing snip creation
        }
        this.isSnipEnabled = true;
        this.snipType = type;
        this.isButtonClicked = true;
        this.setCursor(); // Set the cursor when snip creation is enabled
    }

    setCursor() {
        this.wrapper.classList.add('snip-creation'); // Enable crosshair cursor
    }

    resetCursor() {
        this.wrapper.classList.remove('snip-creation'); // Reset cursor
    }

    makeDraggable(snip) {
        snip.setAttribute("draggable", true);
        snip.addEventListener("dragstart", (e) => this.onDragStart(e, snip));
        snip.addEventListener("dragend", (e) => this.onDragEnd(e, snip));
    }

    onDragStart(event, snip) {
        event.dataTransfer.setData("text", snip.id);
        snip.style.opacity = "0.5";  // Make the snip semi-transparent during dragging
    }

    onDragEnd(event, snip) {
        snip.style.opacity = "1";  // Reset the opacity after dragging
    }

    enableTargetSnip(targetWrapper) {
        console.log(targetWrapper);
        targetWrapper.addEventListener("dragover", (e) => this.onDragOver(e, targetWrapper));
        targetWrapper.addEventListener("drop", (e) => this.onDrop(e, targetWrapper));
    }

    onDragOver(event, targetWrapper) {
        event.preventDefault();
    }

    onDrop(event, targetWrapper) {
        event.preventDefault();
        const snipId = event.dataTransfer.getData("text");
        const draggedSnip = document.getElementById(snipId);
        console.log(snipId);
        if (draggedSnip) {
            const clonedSnip = draggedSnip.cloneNode(true);
            clonedSnip.style.left = `auto`;
            clonedSnip.style.top = `auto`;
            clonedSnip.style.border = 'none';
            try {
                clonedSnip.querySelector('.delete-btn').remove();
            } catch (error) {

            }

            const dropEvent = new CustomEvent("on-dropped", {
                detail: {
                    parent: targetWrapper.id,
                    value: snipId,
                }
            });
            wrapper.dispatchEvent(dropEvent);
            targetWrapper.appendChild(clonedSnip);  // Add cloned snip to target wrapper
        }
    }

    getAllValues() {
        // const targets = document.querySelectorAll()
    }
}
