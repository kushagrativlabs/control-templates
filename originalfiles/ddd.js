
class DDEditor {
  targetColor = "#fcc82d";
  dragColor = "#158AEB";
  constructor(
    wrapper,
    imgUrl,
    enableEditing = true,
    height = 0,
    config = null,
    add_btn = true
  ) {

    const version = "Version: 14/04/2025";
    console.log(version);
    alertMessage(version);
    this.applyOpacity = true;
    this.og = true;
    this.ogHeight = wrapper.offsetHeight;
    this.ogWidth = wrapper.offsetWidth;
    this.isTester = false;
    this.dragCounter = 1;
    this.targetCounter = 1;
    this.singleMatchInput = document.getElementById("singleDrop");
    this.fixedHeight = true;
    this.fixedWidth = true;
    this.fixedHeightCheckbox = document.getElementById("fixedHeight");
    this.fixedWidthCheckbox = document.getElementById("fixedWidth");
    this.areaHeight = 0;
    this.areaWidth = 0;
    this.undoBtn = document.getElementById("undoBtn");
    this.redoBtn = document.getElementById("redoBtn");
    this.currentDrag = "";
    this.undo = [];
    this.redo = [];
    this.mapItem = false;
    this.map = {};
    this.isOneToOne = true;
    this.currentOverlapping = null;
    this.isPlaceHolder = true;
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
    this.ogImage = true;
    this.mainImage.onload = () => this.init();
  }
  addUndo(data) {
    this.undo.push(data);
    this.undoBtn.disabled = this.undo.length == 0;
  }
  removeUndo() {
    if (this.undo.length === 0) return null; // Return null if no items exist
    const lastItem = this.undo.pop(); // Remove and get last item
    this.undoBtn.disabled = this.undo.length == 0;
    this.addRedo(lastItem);
    return lastItem; // Return the removed item
  }
  addRedo(data) {
    this.redo.push(data);
    this.redoBtn.disabled = this.redo.length == 0;
  }
  removeRedo() {
    if (this.redo.length === 0) return null; // Return null if no items exist
    const lastItem = this.redo.pop(); // Remove and get last item
    this.redoBtn.disabled = this.redo.length == 0;
    this.addUndo(lastItem);
    return lastItem; // Return the removed item
  }

  isValid() {
    function showAlert(message) {
      alertWarning(message);
      return false;
    }

    if (self.ogImage) {
      return showAlert("Please select base image.");
    }

    if ($(".snip").length === 0) {
      return showAlert("Please define draggable and target blocks.");
    }

    const emptyElements = $(".snip.target").toArray().filter((element) => {
      const drag = $(element).attr("dragged") ?? "";
      return drag === "";
    });

    if (emptyElements.length !== 0) {
      return showAlert("Matching is not valid. Please map the area by drag and drop.");
    }

    const heights = [];
    const widths = [];

    $(".snip").each(function (_, el) {
      heights.push($(el).outerHeight());
      widths.push($(el).outerWidth());
    });

    const allHeightsEqual = heights.every((h) => h === heights[0]);
    const allWidthsEqual = widths.every((w) => w === widths[0]);

    if (self.fixedHeight && self.fixedWidth) {
      if (!allHeightsEqual || !allWidthsEqual) {
        return showAlert("Not all blocks are in the same size. Please resize any block to align dimensions.");
      }
    } else if (self.fixedHeight) {
      if (!allHeightsEqual) {
        return showAlert("Not all blocks are in the same height. Please resize any block to align dimensions.");
      }
    } else if (self.fixedWidth) {
      if (!allWidthsEqual) {
        return showAlert("Not all blocks are in the same width. Please resize any block to align dimensions.");
      }
    }

    alertMessage("Matching is valid!");
    return true;
  }

  init() {
    this.setMainImage();
    if (this.configs != null) {
      this.handleConfigs(this.configs);
    }
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = "imageInput";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";
    this.wrapper.appendChild(fileInput);
    this.ogImage = true;
  }
  setMainImage(store = false) {
    const parentWidth = this.wrapper.parentElement.clientWidth;
    const imgWidth = this.mainImage.width;
    const imgHeight = this.mainImage.height;
    if (store) {
      this.ogHeight = this.wrapper.clientHeight;
      this.ogWidth = this.wrapper.clientWidth;
    }
    this.width = parentWidth;
    this.height = (imgHeight / imgWidth) * this.width;
    this.wrapper.style.backgroundImage = `url(${this.mainImage.src})`;
    this.wrapper.style.backgroundSize = "cover";
    this.wrapper.style.backgroundRepeat = "no-repeat";
    this.wrapper.style.position = "relative";
    this.wrapper.style.width = `${this.width}px`;
    this.wrapper.style.height = `${this.height}px`;
    if (store) {
      this.ogHeight = this.wrapper.clientHeight;
      this.ogWidth = this.wrapper.clientWidth;
    }
    this.ogImage = false;
  }

  handleConfigs(configs) {
    const self = this;
    const targs = [];
    const drags = [];
    const ogHeight = this.ogHeight;
    const ogWidth = this.ogWidth;
    const newHeight = this.wrapper.clientHeight;
    const newWidth = this.wrapper.clientWidth;
    const isOg = this.isOg;

    // Scale factors for width and height
    const scaleX = isOg ? 1 : newWidth / ogWidth;
    const scaleY = isOg ? 1 : newHeight / ogHeight;
    if ($('.snip').length != 0) {
      $('.snip').remove();
    }
    for (const config of configs.areas) {
      const isTarget = config.type == 1;
      const snip = document.createElement("div");
      snip.classList.add("snip");
      snip.classList.add(isTarget ? "target" : "draggable");
      snip.style.left = `${Math.round(parseFloat(config.x) * scaleX)}px`;
      snip.style.top = `${Math.round(parseFloat(config.y) * scaleY)}px`;
      snip.style.width = `${Math.round(parseFloat(config.width) * scaleX)}px`;
      snip.style.height = `${Math.round(parseFloat(config.height) * scaleY)}px`;


      snip.id = config.id;
      snip.setAttribute("data-points", config.points);
      this.wrapper.appendChild(snip);

      if (!isTarget) {
        snip.style.backgroundImage = `url(${this.mainImage.src})`;
        snip.style.backgroundSize = `${newWidth}px ${newHeight}px`;
        self.makeDraggable(snip);
      } else {
        self.enableTargetSnip(snip);
      }

      if (this.add_btn) {
        snip.appendChild(this.getDeleteButton());
      }

      const idx = parseInt(config.id.split('-')[1]);
      isTarget ? targs.push(idx) : drags.push(idx);
    }

    self.isOneToOne = configs.options.OneToOneMatching;
    self.singleMatchInput.checked = self.isOneToOne;
    self.singleMatchInput.dispatchEvent(new Event("change"));

    self.fixedHeight = configs.options.FixedHeight;
    self.fixedHeightCheckbox.checked = self.fixedHeight;
    self.fixedWidth = configs.options.FixedWidth;
    self.fixedWidthCheckbox.checked = self.fixedWidth;
    document.getElementById("areaHeight").value = configs.options.AreaHeight;
    document.getElementById("areaWidth").value = configs.options.AreaWidth;

    const matchings = configs.match;
    if (matchings) {
      matchings.forEach(function (match) {
        const key = Object.keys(match)[0];


        self.handleDrop(match[key], document.getElementById(key));
      });
      self.updateBackgroundImage();
    }

    try {
      self.dragCounter = drags.sort().reverse()[0] + 1;
      self.targetCounter = targs.sort().reverse()[0] + 1;
    } catch (error) {
      console.error(error);
    }

    this.ogHeight = this.wrapper.clientHeight;
    this.ogWidth = this.wrapper.clientWidth;
    self.updateBackgroundImage();
  }

  addConfigSnap(config, makeDraggable = false) {
    const snip = document.createElement("div");
    snip.classList.add("snip");
    snip.classList.add(
      config.classList.replace("snip", "").replace("selected", "").trim()
    );
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
      this.makeDraggable(snip);
    } else {
      this.enableTargetSnip(snip);
    }
    if (this.add_btn) {
      snip.appendChild(this.getDeleteButton());
    }
  }

  import(jsonData = "") {
    // Check for existing snips before proceeding
    if ($(".snip").length > 0) {
      alertWarning("Please clear all existing snips before importing");
      return;
    }

    // Determine if valid JSON data was provided
    const hasValidData = jsonData && typeof jsonData === 'object';

    if (hasValidData) {
      this.configs = jsonData;
      this.enableEditing = true;

      // Extract dimensions once
      const config = jsonData.wrapper_config;
      const height = parseInt(config.height.replace("px", ""));
      const width = parseInt(config.width.replace("px", ""));

      // Create image with extracted dimensions
      const img = new Image();
      img.src = config.backgroundImage;
      img.height = height;
      img.width = width;

      // Set properties
      this.mainImage = img;
      this.ogHeight = height;
      this.ogWidth = width;
      this.og = false;
      this.isPlaceHolder = false;

      this.setMainImage();
      this.handleConfigs(jsonData);
    }
  }

  export(download = false) {
    if (this.isPlaceHolder) {
      alertWarning("Please select base image.");
      return;
    } else if (
      $(".snip.target").length < 1 ||
      $(".snip.draggable").length < 2
    ) {
      alertWarning("At least 1 target and 2 draggable areas required.");
      return;
    }
    return download ? this.downloadConfigAsJSON() : this.exportConfigs();

  }

  downloadSnip(download = false) {
    // Store selected elements state
    const selected = $('.snip.selected');

    // Apply temporary styles for capturing
    $('.snip,.value').addClass('downloading');
    selected.removeClass('selected');
    $('.resize-handle').css('opacity', '0');

    return new Promise((resolve) => {
      html2canvas(this.wrapper, {
        scale: 10, // Higher resolution
        useCORS: true,
        logging: false,
        backgroundColor: null
      }).then(canvas => {
        const base64Data = canvas.toDataURL("image/png", 1.0);

        // Download if requested
        if (download) {
          const link = document.createElement('a');
          link.href = base64Data;
          link.download = "editor.png";
          link.click();
        }

        // Restore original styles
        $('.snip,.value').removeClass('downloading');
        selected.addClass('selected');
        $('.resize-handle').css('opacity', '1');

        // Return base64 data if download is false
        resolve(download ? true : base64Data);
      });
    });
  }

  isOverlapping(element) {
    let snips = document.querySelectorAll(".snip");
    let rect1 = element.getBoundingClientRect();

    // Get parent element and its bounding rect
    let parent = element.parentElement;
    if (!parent) {
      return true;
    }

    let parentRect = parent.getBoundingClientRect();
    let margin = 0.1; // Margin for overlap detection

    // Check if element is going outside of parent boundaries
    if (
      rect1.left < parentRect.left ||
      rect1.right > parentRect.right ||
      rect1.top < parentRect.top ||
      rect1.bottom > parentRect.bottom
    ) {
      this.currentOverlapping = "parent";
      return true; // Out of bounds
    }

    // Check for overlap with other `.snip` elements
    for (let snip of snips) {
      if (snip === element) continue; // Skip self

      let rect2 = snip.getBoundingClientRect();

      let expandedRect2 = {
        left: rect2.left - margin,
        right: rect2.right + margin,
        top: rect2.top - margin,
        bottom: rect2.bottom + margin,
      };

      if (
        rect1.left < expandedRect2.right &&
        rect1.right > expandedRect2.left &&
        rect1.top < expandedRect2.bottom &&
        rect1.bottom > expandedRect2.top
      ) {
        this.currentOverlapping = snip.id || null;
        return true; // Overlap detected
      }
    }

    return false; // No overlap and inside parent
  }

  getDeleteButton() {
    const deleteBtn = Object.assign(document.createElement("button"), {
      innerText: "×",
      className: "delete-btn",
    });
    return deleteBtn;
  }
  initMouseEvents() {
    this.wrapper.addEventListener("mousedown", (e) => this.startSelection(e));
    this.wrapper.addEventListener("mousemove", (e) => this.updateSelection(e));
    document.addEventListener("mouseup", (e) => this.endSelection(e)); // Ensure mouseup is global
    this.initCommonEvents();
    this.initJquery();
  }
  initJquery() {
    const self = this;
    let movementSpeed = 2;
    let interval;
    let keys = {};
    let isResizing = false;
    let deleteItem = null;

    jQuery(document).ready(function ($) {

      function debounce(func, delay) {
        let timer;
        return function (...args) {
          clearTimeout(timer);
          timer = setTimeout(() => func.apply(this, args), delay);
        };
      }

      window.addEventListener("resize", debounce(() => {
        const config = self.exportConfigs(false);

        if (Object.keys(config).length != 0) {
          self.setMainImage();
          self.handleConfigs(config);
        }
      }, 300));
      $(document).on("click", ".snip:not(.resizing)", function () {
        //toggle selected
        const isSelected = $(this).hasClass("selected");
        const points = $(this).attr("data-points") || 0;
        $("#pointsInput").val(points);

        $(".snip").removeClass("selected");
        $(".resize-handle").remove(); // Remove old handles
        if (!isSelected) {
          $(this).addClass("selected");
          addResizeHandle($(this)); // Add resize handle
          $("#areaHeight").val($(this).height());
          $("#areaWidth").val($(this).width());
          $("#snipX").val(parseInt($(this).css("left")));
          $("#snipY").val(parseInt($(this).css("top")));
        }

        $("#pointsInput").prop("disabled", isSelected);
        $("#snipX").prop("disabled", isSelected);
        $("#snipY").prop("disabled", isSelected);
        self.updateAttrs();
        self.updateTarget();
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
        let $el = $(".snip.selected"); //:not(.is_dragged)
        if (!$el.length || isResizing) return;
        let $parent = $el.parent();
        let pos = $el.position();
        let parentWidth = $parent.width();
        let parentHeight = $parent.height();
        let elWidth = $el.outerWidth();
        let elHeight = $el.outerHeight();
        if (keys[37] && pos.left > 0)
          $el.css("left", Math.max(0, pos.left - movementSpeed) + "px");
        if (keys[38] && pos.top > 0)
          $el.css("top", Math.max(0, pos.top - movementSpeed) + "px");
        if (keys[39] && pos.left + elWidth < parentWidth)
          $el.css(
            "left",
            Math.min(parentWidth - elWidth, pos.left + movementSpeed) + "px"
          );
        if (keys[40] && pos.top + elHeight < parentHeight)
          $el.css(
            "top",
            Math.min(parentHeight - elHeight, pos.top + movementSpeed) + "px"
          );

        const x = parseInt($el.css("left"));
        const y = parseInt($el.css("top"));
        $("#snipX").val(x);
        $("#snipY").val(y);
        self.handleOverlapping(true);
        self.updateBackgroundImage();
      }

      function addResizeHandle($el) {
        const handle = $('<div class="resize-handle"></div>');
        $el.append(handle);
        handle.on("mousedown", function (e) {
          e.preventDefault();
          e.stopPropagation();
          isResizing = true;
          $(document).on("mousemove", resizeElement);
          $(document).on("mouseup", stopResizing);
        });
      }
      function resizeElement(e) {
        if (!isResizing) return;
        let $el = $(".snip.selected");
        $el.addClass("resizing");
        let $parent = $el.parent();
        let parentWidth = $parent.width();
        let parentHeight = $parent.height();
        let newWidth = Math.min(
          parentWidth - $el.position().left,
          e.pageX - $el.offset().left
        );
        let newHeight = Math.min(
          parentHeight - $el.position().top,
          e.pageY - $el.offset().top
        );
        $el.width(Math.max(20, newWidth));
        $el.height(Math.max(20, newHeight));
      }
      function stopResizing(e) {
        isResizing = false;
        $(document).off("mousemove", resizeElement);
        $(document).off("mouseup", stopResizing);
        let $el = $(".snip.selected");
        let $parent = $el.parent();
        let parentWidth = $parent.width();
        let parentHeight = $parent.height();
        let newWidth = Math.min(
          parentWidth - $el.position().left,
          e.pageX - $el.offset().left
        );
        let newHeight = Math.min(
          parentHeight - $el.position().top,
          e.pageY - $el.offset().top
        );
        const height = Math.max(20, newHeight);
        const width = Math.max(30, newWidth);
        if (self.fixedWidth) {
          $(".snip").width(width); //not(.is_dragged)
        }
        if (self.fixedHeight) {
          $(".snip").height(height); //not(.is_dragged)
        }
        $("#areaHeight").val(height);
        $("#areaWidth").val(width);
        self.handleOverlapping();
        self.updateAttrs();
        setTimeout(() => {
          $el.removeClass("resizing");
        }, 100);
      }
      $(document).on("click", ".delete-btn", function (e) {
        e.preventDefault();
        deleteItem = $(this).parent();
        $("#deleteModal").modal("show");
      });


      $(document).on("click", "#confirmDelete", function (e) {
        if (deleteItem != null) {
          const id = deleteItem.attr('id');
          if (deleteItem.hasClass('draggable')) {
            while ($(`#dragged-${id}`).length != 0) {
              $(`#dragged-${id}`).parents('.target').attr('dragged', '');
              $(`#dragged-${id}`).remove();
            }
          } else {
            const dragged = deleteItem.attr('dragged') ?? null;
            if (dragged) {
              self.isOneToOne && $(`#${dragged}`).removeClass('is_dragged');
            }
          }
          deleteItem.remove();
          self.updateTarget();
        }
        $("#deleteModal").modal("hide");
        self.resetSnipCreation();

      });
      $(document).on("change", "#imageInput", function (e) {
        var fileInput = this;
        if (fileInput.files && fileInput.files[0]) {
          var reader = new FileReader();
          reader.onload = function (e) {
            var img = new Image();
            img.src = e.target.result;
            self.mainImage = img;
            img.onload = function () {
              self.setMainImage(true);
            };
            self.isPlaceHolder = false;
            self.configs = null;
          };
          reader.readAsDataURL(fileInput.files[0]);
        }
      });
      $(document).on("click", "#changeBaseImage", function (e) {
        if ($(".snip").length != 0) {
          alertWarning(
            "Please clear all the existing snip before updating this base image"
          );
          return;
        }
        $("#imageInput").click();
      });
      $(document).on("click", "#create-draggable", function (e) {
        if (self.isPlaceHolder) {
          alertWarning("Please select base image.");
          return;
        }
        self.enableSnipCreation("draggable");
      });
      $(document).on("click", "#create-target", function (e) {
        if (self.isPlaceHolder) {
          alertWarning("Please select base image.");
          return;
        }
        self.enableSnipCreation("target");
      });
      $(document).on("click", "#resetAllConfig", function (e) {
        $('#resetConfigModal').modal('show');
      });

      $(document).on('click', '#confirmResetConfig', function (e) {
        $(".snip").each(function (index, element) {
          $(element).remove();
        });
        self.dragCounter = 1;
        self.targetCounter = 1;

        $('#resetConfigModal').modal('hide');
      });
      $(document).on("click", "#resetValues", function (e) {
        $('#resetValueModal').modal('show');
      });

      $(document).on('click', '#confirmResetValue', function (e) {
        $(".snip.draggable").each(function (index, element) {
          $(element).show();
          $(element).removeClass("is_dragged");
        });
        $(".snip.target").each(function (index, element) {
          $(element).find(".value").remove();
          $(element).attr("dragged", "");
        });

        $('#resetValueModal').modal('hide');
      })


      $(self.undoBtn).on("click", function (e) {
        const lastChild = self.removeUndo();
        const target = $(`#${lastChild.target}`);
        const draggable = $(`#${lastChild.draggable}`);
        const beforeHtml = lastChild.beforeHtml;
        target.html(beforeHtml);
        draggable.show();
      });
      $(self.redoBtn).on("click", function (e) {
        const lastChild = self.removeRedo();
        const target = $(`#${lastChild.target}`);
        const draggable = $(`#${lastChild.draggable}`);
        const afterHtml = lastChild.afterHtml;
        target.html(afterHtml);
        lastChild.shouldHide ? draggable.hide() : draggable.show();
      });
      $(document).on("click", ".snip.draggable", function (e) {
        e.stopPropagation();
        self.currentDrag = this.id;
      });
      $(document).on("click", ".snip.target", function (e) {
        e.stopPropagation();
        const target = document.getElementById(this.id);
        if (self.currentDrag != "" && self.isTester) {
          $(this).removeClass("selected");
          $(this).find(".resize-handle").remove();


          self.handleDrop(self.currentDrag, target);
        }
      });
      $(document).on("click", "html", function (e) {
        self.currentDrag = "";
      });
      $(document).on("input", "#pointsInput", function (e) {
        e.preventDefault();
        let value = $(this).val();
        let $el = $(".snip.selected");
        if ($el.length == 0) {
          alertWarning("Please Select an area to assign points");
        }
        $el.attr("data-points", value);
      });
      $(document).on("focus", "#areaHeight,#areaWidth", function (e) {
        self.updateAttrs();
      });

      $(document).on("input", "#areaHeight, #areaWidth", function () {
        const snips = $(".snip"); //:not(.is_dragged)
        const input = $(this);
        let val = parseInt(input.val(), 10); // Convert input to a number

        // Store the previous value if not already set
        if (!input.data("prevValue")) {
          input.data("prevValue", val);
        }

        // Enforce minimum constraints
        if (
          (this.id === "areaHeight" && val < 20) ||
          (this.id === "areaWidth" && val < 30)
        ) {
          input.val(input.data("prevValue")); // Revert to previous valid value
          return;
        }

        // Apply new dimensions
        if (this.id === "areaHeight") {
          self.fixedHeight
            ? snips.height(val)
            : $(".snip.selected").height(val);
        } else {
          self.fixedWidth ? snips.width(val) : $(".snip.selected").width(val);
        }

        // Check for overlapping; if true, revert to previous value
        if (self.handleOverlapping()) {
          input.val(input.data("prevValue"));
        } else {
          input.data("prevValue", val);
        }
      });

      $(document).on("input", "#snipX,#snipY", function (e) {
        const snips = $(".snip");
        const input = $(this);
        const val = input.val();

        if (!input.data("prevValue")) {
          input.data("prevValue", val);
        }

        if (this.id == "snipX") {
          $(".snip.selected").css("left", val + "px");
        } else {
          $(".snip.selected").css("top", val + "px");
        }

        self.handleOverlapping()
          ? input.val(input.data("prevValue"))
          : input.data("prevValue", val);
      });

      $(self.singleMatchInput).on("change", function (e) {

        self.isOneToOne = self.singleMatchInput.checked;
        const map = {};
        let exceeded = false;
        const duplicate = new Set();
        const exded = [];
        if (self.isOneToOne) {
          $('.snip.target').each(function (idx, el) {
            const value = $(el).attr('dragged') ?? '';
            if (value.length != 0) {
              const objKeys = Object.keys(map);
              if (objKeys.includes(value)) {
                map[value] = map[value] + 1;
                exceeded = true;
                exded.push(value);
              } else {
                map[value] = 1;
              }
              duplicate.add(value);
            }
          });

          if (exceeded) {
            self.singleMatchInput.checked = false;
            self.isOneToOne = false;
            const str = exded.join(', ');
            alertWarning(`${str} blocks are matched with multiple targets`);
            return;
          } else {
            duplicate.forEach(function (el) {

              const elmt = $(`#${el}`);
              if (elmt.hasClass('drag_multiple')) {
                elmt.addClass('is_dragged');
                elmt.removeClass('drag_multiple');
                elmt.attr('draggable', false);
              }

            });
          }
        } else {
          $('.snip.draggable').each(function (idx, el) {
            if ($(el).hasClass('is_dragged')) {
              $(el).removeClass('is_dragged');
              $(el).addClass('drag_multiple');
              $(el).attr('draggable', true);
            }
          });
        }
        const sltd = $('.snip.selected');
        sltd.trigger('click');
        sltd.trigger('click');


      });
      const blankOptions = '<option value="" disabled selected>NONE</option>';
      $(document).on("update-select", ".select-wrapper", function (e) {
        let selected = $("#drag-select").val() || "";
        selected = selected.trim();

        let dragOptions = blankOptions;
        let targetOption = self.isOneToOne ? blankOptions : "";
        $(".snip.draggable").each(function (idx, el) {
          const id = el.id;
          dragOptions +=
            id == selected
              ? `<option selected value="${id}">${id}</option>`
              : `<option value="${id}" >${id}</option>`;
        });
        $(".snip.target").each(function (idx, el) {
          const id = el.id;

          targetOption +=
            id == selected
              ? `<option selected value="${id}" >${id}</option>`
              : `<option value="${id}" >${id}</option>`;
        });

        $("#drag-select").html(dragOptions);
        $("#target-select").html(targetOption);
        $("#target-select").trigger("change");
      });

      $(document).on("change", "#target-select", function (e) {
        let selectedTargets = $(this).val();

        if (!Array.isArray(selectedTargets)) {
          selectedTargets = [selectedTargets];
        }

        const element = $(".snip.selected");
        const isDraggable = element.hasClass("draggable");
        const dragSnip = element.attr("id");
        if (isDraggable) {
          const oldTargets = $(`.snip.target[dragged="${dragSnip}"]`);

          if (oldTargets.length != 0) {
            oldTargets.attr("dragged", "");
            oldTargets.find(".value").remove();
          }

          if (selectedTargets.length > 0) {
            // Loop through each selected target and handle the drag-and-drop behavior
            selectedTargets.forEach(function (target) {
              try {
                const draggedAttr = $(`#${target}`).attr("dragged");
                const isEmpty = !draggedAttr || draggedAttr.length === 0;
                if (isEmpty) {
                  if (self.isOneToOne) {


                    self.handleDrop(dragSnip, document.getElementById(target));
                  } else {


                    self.handleDrop(dragSnip, document.getElementById(target));
                  }
                } else {
                  if (draggedAttr.length != 0) {
                    self.restoreDraggable(draggedAttr);
                  }
                  if (dragSnip.length != 0 && document.getElementById(target).length != 0) {



                    self.handleDrop(dragSnip, document.getElementById(target));
                  }

                }
              } catch (error) { }
              if (target == "") {


                self.restoreDraggable(dragSnip);
              }
            });
          }
        } else {
          const val = selectedTargets[0] ?? '';
          const dragOld = element.attr("dragged") ?? "";
          if (val.length != 0) {
            const oldTargets = $(`.target[dragged="${val}"]`);
            if (self.isOneToOne) {
              oldTargets.attr("dragged", "");
              oldTargets.find(".value").remove();
            }
            if (dragOld.length != 0) {

              self.restoreDraggable(dragOld);
            }


            self.handleDrop(val, document.getElementById(dragSnip));
          } else {

            if (dragOld.length != 0) {
              self.restoreDraggable(dragOld);
              element.attr('dragged', '');
              element.find('.value').remove()
            }
          }
        }
      });


      $(document).ready(function () {
        $("#target-select, #drag-select").prepend(
          '<option value="" disabled selected>Choose an option</option>'
        );
      });
    });
    self.updateTarget();
  }

  updateTarget(change = true) {

    const element = $(".snip.selected");
    const isDraggable = element.hasClass("draggable");

    if (element.length === 0) {
      $("#target-select").prop("disabled", true).val("").trigger("change");
      updateChosen();
      return;
    }

    const selected = element.attr("id");
    const blankOptions = this.isOneToOne || !isDraggable
      ? '<option value="">None</option>'
      : "";
    let options = blankOptions;

    if (isDraggable) {
      this.changeSelectType("target-select", !this.isOneToOne);
      $(".snip.target").each(function (_, el) {
        const id = el.id;
        options += `<option value="${id}">${id}</option>`;
      });

      $("#target-select").html(options);

      $(".snip.target")
        .filter(`[dragged='${selected}']`)
        .each(function (_, el) {
          $(`#target-select option[value='${el.id}']`).prop("selected", true);
        });
    } else {
      this.changeSelectType("target-select", false);
      const drag = element.attr("dragged") ?? "";
      $(".snip.draggable").each(function (_, el) {
        const id = el.id;
        options += `<option value="${id}" ${id === drag ? "selected" : ""
          }>${id}</option>`;
      });

      $("#target-select").html(options);
    }


    if (change) {
      $("#target-select").prop("disabled", false).trigger("change");
    }
    updateChosen();
  }

  handleOverlapping(moving = false) {
    const self = this;
    let isOverlapping = false;
    const overlaps = [];
    const vals = [];
    $(".snip").each(function (idx, el) {
      const obj = {};
      if (self.isOverlapping(el)) {
        isOverlapping = true;
        obj[el.id] = self.currentOverlapping;
        overlaps.push(obj);
      } else if (el == document.querySelector(".snip.selected") && moving) {
        self.updateAttrs(el);
      }
    });
    if (isOverlapping) {
      if ($(".jGrowl-notification").length <= 1) {
        overlaps.forEach(function (item) {
          const key = Object.keys(item)[0];
          const value = item[key];
          const isParent = value == "parent";
          if ((vals.includes(key) || vals.includes(value)) && !isParent) {
            return;
          }
          isParent
            ? alertWarning(`Area ${key} going out of bounds!!`)
            : alertWarning(
              `${key} and ${value} is overlapping with each other!`
            );
          vals.push(key, value);
        });
      }
      $(".snip").each(function (idx, el) {
        const top = $(el).attr("top");
        const left = $(el).attr("left");
        const height = $(el).attr("height");
        const width = $(el).attr("width");
        $(el).css("top", top);
        $(el).css("left", left);
        $(el).css("width", width);
        $(el).css("height", height);
      });
    } else {
      this.updateAttrs();
    }
    this.updateBackgroundImage();
    return isOverlapping;
  }
  updateAttrs(el = "") {
    if ($(el).length != 0) {
      const top = $(el).css("top");
      const left = $(el).css("left");
      const height = $(el).css("height");
      const width = $(el).css("width");
      $(el).attr("top", top);
      $(el).attr("left", left);
      $(el).attr("height", height);
      $(el).attr("width", width);
    } else {
      $(".snip").each(function (idx, el) {
        const top = $(el).css("top");
        const left = $(el).css("left");
        const height = $(el).css("height");
        const width = $(el).css("width");
        $(el).attr("top", top);
        $(el).attr("left", left);
        $(el).attr("height", height);
        $(el).attr("width", width);
      });
    }
  }
  initCommonEvents() {
    const self = this;
    self.fixedHeightCheckbox.addEventListener("change", function (e) {
      self.fixedHeight = self.fixedHeightCheckbox.checked;
    });
    self.fixedWidthCheckbox.addEventListener("change", function (e) {
      self.fixedWidth = self.fixedWidthCheckbox.checked;
    });
  }
  exportConfigs(scale= true) {
    const draggables = document.querySelectorAll(".snip");
    const drag_configs = [];
    const target_configs = [];
    const pointsObj = {};
    const areas = [];

    const mainImage = this.mainImage;
    const mainImageWidth = mainImage.naturalWidth || mainImage.width;
    const mainImageHeight = mainImage.naturalHeight || mainImage.height;

    const wrapperWidth = parseFloat(this.wrapper.style.width);
    const wrapperHeight = parseFloat(this.wrapper.style.height);

    const ratioX = scale ? mainImageWidth / wrapperWidth : 1;
    const ratioY = scale ? mainImageHeight / wrapperHeight: 1;

    let ah = 0;
    let aw = 0;

    for (const draggable of draggables) {
      const dragConfig = {};
      const area = {};
      const point = parseInt(draggable.getAttribute("data-points") ?? 0);

      const left = parseFloat(draggable.style.left);
      const top = parseFloat(draggable.style.top);
      const width = parseFloat(draggable.style.width);
      const height = parseFloat(draggable.style.height);

      area.id = draggable.id;
      area.type = draggable.className.includes("target") ? 1 : 2;

      // Adjusted by ratio and converted to int
      area.x = Math.round(left * ratioX);
      area.y = Math.round(top * ratioY);
      area.width = Math.round(width * ratioX);
      area.height = Math.round(height * ratioY);
      area.points = point;
      ah = area.height;
      aw = area.width;
      pointsObj[area.id] = point;

      dragConfig.classList = draggable.className;
      dragConfig.style_position = draggable.style.position;
      dragConfig.style_left = draggable.style.left;
      dragConfig.style_top = draggable.style.top;
      dragConfig.style_height = draggable.style.height;
      dragConfig.style_width = draggable.style.width;
      dragConfig.id = draggable.id;

      if (dragConfig.classList.includes("target")) {
        target_configs.push(dragConfig);
      } else {
        dragConfig.backgroundPosition = `-${Math.round(left)}px -${Math.round(top)}px`;
        drag_configs.push(dragConfig);
      }

      areas.push(area);
    }

    const wrapper_config = {
      backgroundImage:
        this.configs != null
          ? this.configs.wrapper_config.backgroundImage
          : this.getBase64Image(mainImage),
      width: mainImageWidth + "px",
      height: mainImageHeight + "px",
    };

    const options = {
      OneToOneMatching: this.isOneToOne,
      FixedHeight: this.fixedHeight,
      FixedWidth: this.fixedWidth,
      AreaHeight: this.fixedHeight ? ah : parseInt($("#areaHeight").val()),
      AreaWidth: this.fixedWidth ? aw : parseInt($("#areaWidth").val()),
    };

    const match = [];
    $(".snip.target").each(function (idx, el) {
      const ID = el.id;
      const drag = $(this).attr("dragged") ?? "";
      const obj = {};
      obj[ID] = drag;
      match.push(obj);
    });

    const points = [];
    const pointsKey = Object.keys(pointsObj);
    pointsKey.forEach((key) => {
      const obj = {};
      obj[key] = pointsObj[key];
      points.push(obj);
    });

    const allConfigs = {
      wrapper_config,
      areas,
      options,
      match,
      points
    };

    return allConfigs;
  }




  downloadConfigAsJSON() {
    const configData = this.exportConfigs();
    const jsonString = JSON.stringify(configData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "config.json"; // Filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  getBase64Image(img) {
    const bgImage = img.src;
    if (bgImage.startsWith('url("data:image')) {
      return bgImage; // Extract the actual data URL
    }
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png"); // Convert to Base64 PNG
  }
  startSelection(event) {
    if (
      this.isCreatingSnip ||
      !this.isSnipEnabled ||
      this.currentSnip ||
      !this.isButtonClicked
    )
      return;
    this.isSelecting = true;
    this.isCreatingSnip = true; // Set the flag to true when snip creation starts
    const wrapperRect = this.wrapper.getBoundingClientRect();
    this.startX = event.clientX - wrapperRect.left;
    this.startY = event.clientY - wrapperRect.top;
    this.currentSnip = document.createElement("div");
    this.currentSnip.classList.add("snip");
    this.currentSnip.classList.add(this.snipType);
    this.currentSnip.style.position = "absolute";
    this.currentSnip.style.left = `${this.startX}px`;
    this.currentSnip.style.top = `${this.startY}px`;
    this.currentSnip.style.border =
      this.snipType == "target"
        ? `2px dashed ${this.targetColor}`
        : `2px solid ${this.dragColor}`;
    this.currentSnip.id =
      this.snipType == "target"
        ? "targ-" + this.targetCounter++
        : "drag-" + this.dragCounter++;
    this.wrapper.appendChild(this.currentSnip);
  }
  updateSelection(event) {
    if (!this.isSelecting || !this.currentSnip) return;

    const wrapperRect = this.wrapper.getBoundingClientRect();
    const currentX = event.clientX - wrapperRect.left;
    const currentY = event.clientY - wrapperRect.top;

    // Ensure width and height are positive by setting min value at startX/startY
    const width = Math.max(currentX - this.startX, 0);
    const height = Math.max(currentY - this.startY, 0);

    this.currentSnip.style.left = `${this.startX}px`;
    this.currentSnip.style.top = `${this.startY}px`;
    this.currentSnip.style.width = `${width}px`;
    this.currentSnip.style.height = `${height}px`;
  }

  endSelection(event) {
    if (!this.isSelecting) return;
    this.isSelecting = false;
    if (this.currentSnip) {
      let height = jQuery(this.currentSnip).height();
      let width = jQuery(this.currentSnip).width();
      width = Math.max(width, 30);
      height = Math.max(height, 20);
      jQuery(this.currentSnip).height(height);
      jQuery(this.currentSnip).width(width);

      const snip = this.currentSnip;

      const isOverlapping = this.isOverlapping(this.currentSnip);

      if (
        this.currentSnip.offsetWidth < 10 ||
        this.currentSnip.offsetHeight < 10 ||
        isOverlapping
      ) {
        this.deleteSnip(this.currentSnip);
        if (isOverlapping) {
          alertWarning("Selection is not valid it is overlapping");
        }
      } else {
        if (this.snipType === "draggable") {
          this.updateBackgroundImage();
          this.makeDraggable(this.currentSnip);
        } else {
          this.enableTargetSnip(this.currentSnip);
        }
        if (this.add_btn) {
          this.currentSnip.appendChild(this.getDeleteButton());
        }
        this.handleHeightWidth(this.currentSnip);
      }

      if (this.isOverlapping(snip)) {
        this.deleteSnip(snip);
        alertWarning("Selection is not valid it is overlapping");
      }

    }



    this.resetSnipCreation();


  }
  handleHeightWidth(currentSnip) {
    if (!this.fixedHeight && !this.fixedWidth) return;
    const length = document.querySelectorAll(".snip").length;
    const isSingle = length === 1;
    if (this.fixedHeight) {
      if (isSingle) {
        $("#areaHeight").val($(currentSnip).height() || 20);
      } else {
        $(currentSnip).height($("#areaHeight").val());
      }
    }
    if (this.fixedWidth) {
      if (isSingle) {
        $("#areaWidth").val($(currentSnip).width() || 30);
      } else {
        $(currentSnip).width($("#areaWidth").val());
      }
    }
  }
  updateBackgroundImage() {
    const self = this;
    const wrapperRect = this.wrapper.getBoundingClientRect();
    const url = this.mainImage.src;
    $(".snip.draggable").each(function (idx, snip) {
      const left = parseFloat(snip.style.left);
      const top = parseFloat(snip.style.top);
      snip.style.backgroundImage = `url(${url})`;
      snip.style.backgroundSize = `${wrapperRect.width}px ${wrapperRect.height}px`;
      snip.style.backgroundPosition = `-${left + 2}px -${top + 2}px`;
      const id = snip.id;
      const els = $(`.snip[dragged='${id}']`);

      if (els.length != 0) {
        els.each(function (idx, el) {
          const snp = $(el).find('.value').get(0);
          snp.style.backgroundImage = `url(${url})`;
          snp.style.backgroundSize = `${wrapperRect.width}px ${wrapperRect.height}px`;
          snp.style.backgroundPosition = `-${left + 2}px -${top + 2}px`;
          $(snp).width($(snip).width());
          $(snp).height($(snip).height());
        })
      }
    });
  }
  deleteSnip(snip) {
    if (snip) snip.remove();
    this.resetSnipCreation();
  }
  resetSnipCreation() {
    this.isButtonClicked = false;
    this.isCreatingSnip = false;
    this.currentSnip = null;
    this.resetCursor();
  }
  enableSnipCreation(type) {
    if (this.isCreatingSnip) {
      this.resetSnipCreation();
    }
    this.isSnipEnabled = true;
    this.snipType = type;
    this.isButtonClicked = true;
    this.setCursor();
  }
  setCursor() {
    this.wrapper.classList.add("snip-creation");
  }
  resetCursor() {
    this.wrapper.classList.remove("snip-creation");
  }
  makeDraggable(snip) {
    snip.setAttribute("draggable", true);
    snip.addEventListener("dragstart", (e) => this.onDragStart(e, snip));
    snip.addEventListener("dragend", (e) => this.onDragEnd(e, snip));
  }

  onDragStart(event, snip) {
    event.dataTransfer.setData("text", snip.id);
    // snip.style.opacity = "0.5";
    snip.classList.add("dropping");
  }
  onDragEnd(event, snip) {
    try {

      setTimeout(function () {
        snip.classList.remove("dropping");
      }, 1500);
    } catch (error) { }
   
    // snip.classList.remove('dropping');
  }
  enableTargetSnip(targetWrapper) {
    targetWrapper.addEventListener("dragover", (e) =>
      this.onDragOver(e, targetWrapper)
    );
    targetWrapper.addEventListener("drop", (e) =>
      this.onDrop(e, targetWrapper)
    );
  }
  disableTargetSnip(targetWrapper) {
    targetWrapper.removeEventListener("dragover", (e) =>
      this.onDragOver(e, targetWrapper)
    );
    targetWrapper.removeEventListener("drop", (e) =>
      this.onDrop(e, targetWrapper)
    );
  }
  onDragOver(event, targetWrapper) {
    event.preventDefault();
  }
  onDrop(event, targetWrapper) {
    event.preventDefault();

    const snipId = event.dataTransfer.getData("text");


    this.handleDrop(snipId, targetWrapper);
  }
  handleDrop(snipId, targetWrapper, validate = false) {
    if (targetWrapper.id == snipId) {
      return;
    }
    if (targetWrapper && snipId != "") {

      const draggedSnip = document.getElementById(snipId);
      if (!targetWrapper.className.includes("draggable") && !draggedSnip.className.includes('value')) {
        console.log('eheheheh')
        let beforeHtml = targetWrapper.innerHTML;
        const old = targetWrapper.querySelector(".value");
        if (old) {
          try {


            this.restoreDraggable(targetWrapper.getAttribute("dragged"));
          } catch (error) { }
          old.remove();
        }

        if (draggedSnip) {
          const clonedSnip = draggedSnip.cloneNode(true);
          clonedSnip.classList.remove("snip", "draggable", "dropping");
          clonedSnip.classList.add("value");
          clonedSnip.style.left = `auto`;
          clonedSnip.style.top = `auto`;
          clonedSnip.style.border = "none";
          // clonedSnip.style.opacity = "0.5";
          clonedSnip.setAttribute("data-id", clonedSnip.id);
          clonedSnip.id = "dragged-" + clonedSnip.id;
          try {
            clonedSnip.querySelector(".resize-handle").remove();
          } catch (error) { }

          try {
            clonedSnip.querySelector(".delete-btn").remove();
          } catch (error) { }
          const dropEvent = new CustomEvent("on-dropped", {
            detail: {
              parent: targetWrapper.id,
              value: snipId,
            },
          });
          wrapper.dispatchEvent(dropEvent);
          targetWrapper.appendChild(clonedSnip);
          $(targetWrapper).attr("dragged", draggedSnip.id);
          let shouldHide = false;
          if (this.isOneToOne) {
            draggedSnip.classList.add("is_dragged");
            shouldHide = true;
            draggedSnip.removeAttribute("draggable");
          } else {

            draggedSnip.classList.add("drag_multiple");
          }
          this.enableTargetSnip(draggedSnip);

          this.makeDraggable(clonedSnip);
          const afterHtml = targetWrapper.innerHTML;
          this.addUndo({
            draggable: draggedSnip.id,
            target: targetWrapper.id,
            shouldHide,
            beforeHtml,
            afterHtml,
          });
        }
        this.updateTarget(false);
      } else {

        try {
          const targetID = targetWrapper.id;

          const snipElement = document.querySelector(".dropping");
          const id = snipElement.id.replace("dragged-", "");
          const parent = snipElement.parentNode;
 
         if (targetID == parent.id) {
            // this.applyOpacity =false;
            return
          }
    
          // this.applyOpacity = true;

          if (parent.className.includes('target')) {
            $(parent).find('.value').remove();
            $(parent).attr('dragged', '');
            if (id) {
              const dragble = $(`#${id}`);
              dragble.removeClass("is_dragged");
              dragble.removeClass("drag_multiple");
              dragble.attr("draggable", "true");
              dragble.css({ 'opacity': 1 })
            }
            this.updateTarget();
            return;
          }


          if (targetID == id) {
            targetWrapper.classList.remove("is_dragged", "drag_multiple");
            targetWrapper.setAttribute("draggable", "true");
            // targetWrapper.style.opacity = 1;
            parent.setAttribute("dragged", "");
            draggedSnip.remove();
            this.updateBackgroundImage();
          }
          this.updateTarget();
        } catch (error) { }
      }
    }

  }

  restoreDraggable(dragID) {

    if (dragID.length != 0) {
      console.log('heheh')
      const dragble = $(`#${dragID}`);
      dragble.removeClass("is_dragged", "drag_multiple");
      dragble.attr("draggable", "true");
      // dragble.css({ 'opacity': 1 });
      updateChosen();
    }
  }

  changeSelectType(elmId, multiple) {
    var obj = $("#" + elmId);
    var objChzn = byid(elmId + "_chzn");
    if (objChzn) {
      objChzn.remove();
    }
    obj.chosen("destroy");
    if (multiple) {
      obj.attr("multiple", "multiple");
    } else {
      obj.removeAttr("multiple");
    }
    obj.removeClass("chzn-done");
    obj.chosen();
  }
}
