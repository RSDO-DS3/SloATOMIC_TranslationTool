var API_HOST = 'http://slo-atomic2020.feri.um.si:4000'; // todo: make this an .env variable

function updateProgressBars(progressArr) {
    let totalDev = Math.floor(100 * progressArr[0] / progressArr[1]);
    let totalTrain = Math.floor(100 * progressArr[2] / progressArr[3]);
    let totalTest = Math.floor(100 * progressArr[4] / progressArr[5]);
    let totalTotal = Math.floor(100 * (progressArr[0] + progressArr[2] + progressArr[4]) / (progressArr[1] + progressArr[3] + progressArr[5]));
    let bars = $('.progress-pie-color');
    $(bars[0]).attr('data-value', totalDev);
    $(bars[1]).attr('data-value', totalTrain);
    $(bars[2]).attr('data-value', totalTest);
    $(bars[3]).attr('data-value', totalTotal);
}

function debounce(fn, ms) {
    if (window.synonymTimeout) {
        clearTimeout(window.synonymTimeout);
    }
    window.synonymTimeout = setTimeout(fn, ms);
}

function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

function setupBtnToCloseSynonims() {
    $('a.closesynonims').click(function (e) {
        $('.tablebodyscrollable').empty();
        $('.synonymrow').remove();
        $('.synonymtable').addClass('hide d-none');
    })
}

function setupSynonyms() {
    document.addEventListener('mouseup', function (e) {
        if (!$(e.target).hasClass('closesynonims') && $(e.target).hasClass('synonimsearchenabled'))
            debounce(getSynonym, 1000);
    });
}

function loadSynonymResults(data) {
    $('.synonymnoresults').addClass('hide');
    $('.synonymtable').removeClass('hide d-none');
    $('.synonymrow').remove();
    let result = JSON.parse(data);
    result.forEach(function (synonym) {
        $(`<tr class='synonymrow'><td>${synonym.naziv}</td><td>${synonym.razlaga}</td></tr>`).appendTo('.tablebodyscrollable');
    });
}

function getSynonym() {
    let text = getSelectionText();
    if (text.trim().length == 0) return;
    $.ajax({
        url: API_HOST + '/api/getSynonym?geslo=' + text.trim(),
        method: 'GET',
        success: function (data) {
            //console.dir(data);
            loadSynonymResults(data);
        },
        error: function (xhr, msg, status) {
            // console.error(xhr.responseText);
            console.error(xhr, "xhr");
            console.error(msg, "msg");
            console.error(status, "status");
        }
    });
}

function appendRevisionToDiv(el, rev) {
    /* rev
    comment: "Some comment ig"
    createdAt: "2022-05-09T13:56:11.393Z"
    edge: "xEffect"
    head: "OsebaX zlorablja pooblastila osebeX"
    tail: "POSTANITE ŠIBKI --> WHY IS THIS CAPS??"
    user: "6273d740501b3b3c2d1d507b"
    __v: 0
    _id: "62791d7bfd00fcfd46015a9f"
    */

}

function setupForms() {
    $('.record-parent form').each(function (i, elt) {
        $(elt).on('submit', function (e) {
            e.preventDefault();
            let btnName = e.originalEvent.submitter.name
            $(elt[name = 'skipping']).val(btnName === "button_mark_todo" ? 1 : 0);

            let recParent = $(elt).parents('.record-parent');
            let bar = recParent.find('.accord-bar');
            let loopIdx = bar.prevObject.attr('id').replace('record', '')

            if (btnName === 'button_next_r' || btnName === 'button_previous_r') {
                let acc = $(elt).closest('#accordion').children()
                //  collapse current one
                $(elt).parents('.show').collapse('hide');

                let aIdx = (loopIdx - 1) + (btnName === 'button_next_r' ? 1 : -1);
                $($(acc[aIdx]).children('div')[0]).collapse('show')
                return;
            }

            $.ajax(
                {
                    url: '/Record/updateRecord',
                    method: elt.method,
                    data: $(elt).serialize(),
                    success: function (response) {
                        // console.log($(elt))
                        console.log(response)
                        if (response?.numRecordsAssigned)
                            updateProgressBars(response.numRecordsAssigned)
                        $(elt).find('.savebtnrecord').attr('disabled', 'disabled');
                        $(elt).find('.savesuccessmodal').removeClass('hide');

                        // let recParent = $(elt).parents('.record-parent');
                        recParent.addClass('edited');
                        let ski = $(elt[name = 'skipping']).val() == 1;
                        if (ski) {
                            recParent.addClass('marked-for-later');
                        } else {
                            recParent.removeClass('marked-for-later');
                        }
                        let leftTheSame = !response?.head?.includes("-->") && !response?.tail?.includes("-->")
                        // if (leftTheSame && !ski) {
                        //     recParent.addClass('edited-was-ok');
                        //     recParent.removeClass('edited marked-for-later');
                        // }
                        if (!leftTheSame && !ski) {
                            recParent.addClass('edited');
                            recParent.removeClass('edited-was-ok marked-for-later');
                        }
                        if (response?.revertedBackToInitial) {
                            recParent.removeClass('edited edited-was-ok marked-for-later');
                        }

                        // let bar = recParent.find('.accord-bar');
                        if (!ski) {
                            bar.find('a').remove();
                        }
                        if (ski || response?.revertedBackToInitial) {
                            // let loopIdx = bar.prevObject.attr('id').replace('record', '')
                            if (!$(bar.find(`a#isokbtn${loopIdx}`)).length)
                                $(bar.find('div.left-side-acc'))
                                    .prepend(`<span><a id="isokbtn${loopIdx}" class="btn btn-outline-success btn-sm me-1">OK</a></span>`)
                            setupOKbuttons()
                        }

                        $($(bar.children()[0]).find('kbd')[1]).text(response?.head?.split(' --> ').at(-1));
                        $($(bar.children()[2]).find('kbd')[1]).text(response?.tail?.split(' --> ').at(-1));

                        let revHist = $($(elt).find('div.rev-div'))
                        revHist.load(location.href + ' #' + revHist.attr('id'))
                        // appendRevisionToDiv($(elt), response);

                        setTimeout(function () {
                            $(elt).find('.savesuccessmodal').addClass('hide');
                            $(elt).find('.savebtnrecord').removeAttr('disabled');
                            $(elt[name = 'skipping']).val(0);
                            $(elt).parents('.show').collapse('hide');
                            $(elt[name = 'comment']).val('')
                            $(elt[name = 'comment']).parent().find('select').prop('selectedIndex', 0);
                        }, 1000);

                        console.dir(response);
                    },
                    error: function (xhr, msg, err) {
                        if (xhr.responseText === "No changes were made.") {
                            let defaultTxt = " Ni bilo nobene spremembe!";

                            if (btnName === 'button_save_changes') {
                                let okBTN = $($(elt).closest('#accordion').children()[loopIdx - 1]).find(`#isokbtn${loopIdx}`)
                                if (okBTN.length === 0) {
                                    defaultTxt = " Ni bilo sprmembe na že označenem dokumentu!"
                                } else {
                                    okBTN.click();
                                    return;
                                }
                            }

                            $(elt).find('.savebtnrecord').attr('disabled', 'disabled');

                            let saveSucc = $(elt).find('.savesuccessmodal');
                            saveSucc.text(defaultTxt);
                            saveSucc.removeClass('alert-success');
                            saveSucc.addClass('alert-danger');
                            saveSucc.removeClass('hide');

                            setTimeout(() => saveSucc.addClass('hide'), 2400);
                            setTimeout(function () {
                                saveSucc.text(" Spremembe so shranjene!");
                                saveSucc.addClass('alert-success');
                                saveSucc.removeClass('alert-danger');
                                $(elt).find('.savebtnrecord').removeAttr('disabled');
                                // $(elt).parents('.show').collapse('hide');
                            }, 3000);


                        } else if (xhr.status === 403) {
                            $.alert({
                                title: 'Error!',
                                type: 'red',
                                content: xhr.responseText ?? msg
                            });
                        } else {
                            console.dir(xhr);
                            console.dir(msg);
                            console.dir(err);
                        }

                    }
                }
            );
            return false;
        });
    });

    $('#filter-form').on('submit', function (e) {
        e.preventDefault();
        let chk = $(this).find('input').is(":checked") ? '&unedited=true' : '';
        let act = this.action.replace('&unedited=true', '');
        window.location.assign(act + chk);
    });

    $('.record-parent .accordion-button').each(function (i, el) {
        $(el).mousedown(function (e) {
            e.preventDefault();
            // e.stopPropagation();
            if (e.button === 0 && !e.shiftKey && !e.ctrlKey) { // LMB
                if ($(e.target).attr('id')?.startsWith("isokbtn")) {
                    $(el).removeAttr('data-bs-toggle');
                }
            }
            if (e.button === 1 || (e.shiftKey && e.button === 0) || (e.ctrlKey && e.button === 0)) { // Middle mouse or SHIFT+LMB or CTRL+LMB
                let form = $(el).parent().parent().find('form');
                let oldHeadVal = form.find('input[name="head"]').val();
                let file = form.find('input[name="file"]').val();
                $.confirm({
                    title: 'Uredi vse z istim HEAD',
                    content: `<div><div>Trenuten head:</div>` +
                        `<div><strong>${oldHeadVal}</strong></div></div>` +
                        '<form action="" class="mt-2">' +
                        '<div class="form-group">' +
                        '<label>Novi head:</label>' +
                        `<input type="text" placeholder="Vnesi novi head" value="${oldHeadVal}" class="form-control newHeadVal form-control" required />` +
                        '<div class="font-11 mt-3 opacity-50"><strong>Predlog:</strong> Prvo uredite vse tail-e tega head-a</div>' +
                        '</div>' +
                        '</form>',
                    buttons: {
                        confirm: {
                            text: "Uredi!",
                            btnClass: 'btn-success',
                            action: function () {
                                let newHeadVal = this.$content.find('.newHeadVal').val();
                                newHeadVal?.trim();
                                oldHeadVal?.trim();
                                if (!newHeadVal) {
                                    $.alert({
                                        content: 'Novi head ne sme bit prazen',
                                        title: 'Napaka',
                                        type: 'red'
                                    });
                                    return false;
                                }
                                if (newHeadVal === oldHeadVal) {
                                    $.alert({
                                        content: 'Novi head ne sme bit enak kot stari',
                                        title: 'Napaka',
                                        type: 'red'
                                    });
                                    return false;
                                }

                                $.ajax(
                                    {
                                        url: '/Record/updateRecordsHeads',
                                        method: 'POST',
                                        data: {newHeadVal, oldHeadVal, file},
                                        success: function (response) {
                                            updateProgressBars(response.progress);
                                            $.alert({
                                                title: 'Success!',
                                                type: 'green',
                                                content: `Updated ${response.updated} records`,
                                                onClose: function () {
                                                    location.reload(); // we want the colors to change
                                                }
                                            });
                                        },
                                        error: function (xhr, msg, err) {
                                            $.alert({
                                                title: 'Error!',
                                                type: 'red',
                                                content: xhr.responseText ?? msg
                                            });
                                            console.dir(xhr);
                                            console.dir(msg);
                                            console.dir(err);
                                        }
                                    }
                                );

                            }
                        },
                        cancel: {
                            text: "Prekliči",
                            keys: ['esc'],
                            btnClass: 'btn-danger'
                        }
                    },
                    onContentReady: function () {
                        var jc = this;
                        this.$content.find('form').on('submit', function (e) {
                            e.preventDefault();
                            // if the user submitted the form by pressing enter
                            jc.$$confirm.trigger('click');
                        });
                    }
                });
            }

        });
    });

    $('#all-disp-ok').click(function () {
        // $('div.accordion').find('a.btn').each(function (i, el) {
        //     $(el).trigger('click');
        // });

        $.confirm({
            title: 'Ste prepričani?',
            content: '<strong>Vse vidne neurejene elemente</strong> boste označili kot sprmenljive',
            buttons: {
                confirm: {
                    text: "Potrdi",
                    keys: ['enter'],
                    btnClass: 'btn-success',
                    action: function () {
                        let file = ""
                        let anyChangesMade = false;
                        let toUpdate = []
                        $('div.accordion').find('form').each(function (i, el) {
                            // $(el).trigger('click');
                            // we also ignore the marked for later ones
                            let alrEdited = $(this).parents('.accordion-item').is('.edited, .edited-was-ok, .marked-for-later')
                            if (!alrEdited) {
                                file = $(this[name = "file"]).val();
                                $(this[name = "comment"]).val(""); // se bo avtomatsko nastavil na serveru
                                anyChangesMade = true
                                toUpdate.push(
                                    {
                                        "id": $(this[name = "id"]).val(),
                                        "head": $(this[name = "head"]).val(),
                                        "tail": $(this[name = "tail"]).val(),
                                        "comment": $(this[name = "comment"]).val(),
                                        "file": file,
                                        "unchanged": true
                                    });
                            }
                        });
                        if (anyChangesMade) {
                            $.ajax(
                                {
                                    url: "/Record/updateRecordMany",
                                    method: "POST",
                                    data: {'toUpdate': toUpdate, 'massEditing': true},
                                    success: function (response) {
                                        location.reload();
                                    },
                                    error: function (xhr, msg, err) {
                                        console.dir(xhr);
                                        console.dir(msg);
                                        console.dir(err);
                                    }
                                }
                            )
                        } else $.alert("Ni bilo izvedenih sprememb. Morda so že vsi vidni dokumenti na strani označeni..");
                    }
                },
                cancel: {
                    text: "Prekliči",
                    keys: ['esc'],
                    btnClass: 'btn-danger'
                }
            }

        });


    });

    $('.user-parent form.setupping').each(function (i, elt) {
        $(elt).on('submit', function (e) {
            e.preventDefault();

            let devNew = Number($(elt[name = 'devAssigned']).val());
            let devOld = Number($(elt[name = 'devAssigned']).attr('aria-label'));
            let devToaAdd = devNew - devOld;

            let trainNew = Number($(elt[name = 'trainAssigned']).val());
            let trainOld = Number($(elt[name = 'trainAssigned']).attr('aria-label'));
            let trainToaAdd = trainNew - trainOld;

            let testNew = Number($(elt[name = 'testAssigned']).val());
            let testOld = Number($(elt[name = 'testAssigned']).attr('aria-label'));
            let testToaAdd = testNew - testOld;

            if (!isNaN(devToaAdd) && devToaAdd > 0) {
                $(elt[name = 'devAssigned']).val(devToaAdd);
                $(elt[name = 'alsoGiveMore']).val("true");
            } else {
                $(elt[name = 'devAssigned']).val(0);
            }
            if (!isNaN(trainToaAdd) && trainToaAdd > 0) {
                $(elt[name = 'trainAssigned']).val(trainToaAdd);
                $(elt[name = 'alsoGiveMore']).val("true");
            } else {
                $(elt[name = 'trainAssigned']).val(0);
            }
            if (!isNaN(testToaAdd) && testToaAdd > 0) {
                $(elt[name = 'testAssigned']).val(testToaAdd);
                $(elt[name = 'alsoGiveMore']).val("true");
            } else {
                $(elt[name = 'testAssigned']).val(0);
            }


            $.ajax(
                {
                    url: '/User/editUser',
                    method: elt.method,
                    data: $(elt).serialize(),
                    success: function (response) {
                        $(elt[name = 'devAssigned']).val(devNew);
                        $(elt[name = 'trainAssigned']).val(trainNew);
                        $(elt[name = 'testAssigned']).val(testNew);
                        $(elt[name = 'devAssigned']).attr('aria-label', devNew);
                        $(elt[name = 'trainAssigned']).attr('aria-label', trainNew);
                        $(elt[name = 'testAssigned']).attr('aria-label', testNew);

                        $(elt).find('.savesuccessmodal').removeClass('hide');
                        setTimeout(function () {
                            $(elt).find('.savesuccessmodal').addClass('hide');
                        }, 2500);
                    },
                    error: function (xhr, msg, err) {
                        console.dir(xhr);
                        console.dir(msg);
                        console.dir(err);
                    }
                }
            );
            return false;
        });
    });

    $('#zamenjava-form').on('submit', function (e) {
        e.preventDefault();
        // let inputs = $('#zamenjava-form').children('input');
        let oldHead = $(this[name = 'oldHead']).val(); // substring to search for
        let newHead = $(this[name = 'newHead']).val(); // substring to replace it with
        let oldTail = $(this[name = 'oldTail']).val(); // same as above for tail
        let newTail = $(this[name = 'newTail']).val();
        let alsoEditEdited = $(this[name = 'alsoEditEdited']).is(":checked");

        if ((oldHead === newHead) && (oldHead && newHead)) return $.alert("Napaka! Stari in novi (HEAD) tekst sta enaka...");
        if ((oldTail === newTail) && (oldTail && newTail)) return $.alert("Napaka! Stari in novi (TAIL) tekst sta enaka...");

        if ((!oldHead && newHead) || (oldHead && !newHead) || (!oldTail && newTail) || (oldTail && !newTail))
            return $.alert("Pri napredni zamenjavi je potrebno izpolnit ali oba zgornja vnosa, in/ali oba spodnja vnosa");

        // let elems = $(this).serializeArray().reduce((o,kv) => ({...o, [kv.name]: kv.value}), {});

        let file = ""
        let anyChangesMade = false;
        let toUpdate = []
        $('div.accordion').find('form').each(function (i, el) {
            // $(el).trigger('click');
            let alrEdited = $(this).parents('.accordion-item').is('.edited, .edited-was-ok')
            if (!alrEdited || alsoEditEdited) {
                let changesMade = false;
                file = $(this[name = "file"]).val()

                if ((oldHead && newHead) && $(this[name = "head"]).val().includes(oldHead)) {
                    changesMade = true;
                    $(this[name = "head"]).val($(this[name = "head"]).val().replace(oldHead, newHead));
                }

                if ((oldTail && newTail) && $(this[name = "tail"]).val().includes(oldTail)) {
                    changesMade = true;
                    $(this[name = "tail"]).val($(this[name = "tail"]).val().replace(oldTail, newTail));
                }

                if (changesMade) {
                    let komentar = "Sistemski komentar: Sprememba je bila izvedena z naprednim urejevalnikom--" + $('#zamenjava-form').children('textarea').val();
                    $(this[name = "comment"]).val(komentar);

                    // $(this).submit();
                    anyChangesMade = true
                    // bw.push({
                    //     "updateOne":
                    //         {
                    //             "filter": {"_id": $(this[name = "id"]).val()},
                    //             "update":
                    //                 {
                    //                     "head": $(this[name = "head"]).val(),
                    //                     "tail": $(this[name = "tail"]).val(),
                    //                     "comment": $(this[name = "comment"]).val()
                    //                 }
                    //         }
                    // });

                    toUpdate.push(
                        {
                            "id": $(this[name = "id"]).val(),
                            "head": $(this[name = "head"]).val(),
                            "tail": $(this[name = "tail"]).val(),
                            "comment": $(this[name = "comment"]).val(),
                            "file": file
                        });
                }
            }

        });
        if (anyChangesMade) {
            // location.reload(); // we want the colors to change, for this use case we'll just refresh.
            $.ajax(
                {
                    url: "/Record/updateRecordMany",
                    method: "POST",
                    data: {'toUpdate': toUpdate, 'massEditing': true},
                    success: function (response) {
                        location.reload();
                    },
                    error: function (xhr, msg, err) {
                        console.dir(xhr);
                        console.dir(msg);
                        console.dir(err);
                    }
                }
            )
        } else $.alert("Ni bilo izvedenih sprememb. Preverite, če ste ustrezno izpolnili polja. Če želite, da se " +
            "spremembe izvajaju tudi nad že urejenimi elementi (so pobarvani) potem ne pozabit stistnit na " +
            "*Izvedi operacijo tudi nad že urejenimi*");
    });

    $('.admin-make-user input').keyup(function () {
        let empty = false;
        $('.admin-make-user input').each(function () {
            if ($(this).val() == '') {
                empty = true;
            }
        });
        if (empty) {
            $('#Admin-create-user').attr('disabled', 'disabled');
        } else {
            $('#Admin-create-user').removeAttr('disabled');
        }
    });

    $('.register-user input').keyup(function () {
        let empty = false;
        $('.register-user input').each(function () {
            if ($(this).val() == '') {
                empty = true;
            }
        });
        if (empty) {
            $('#Register-button').attr('disabled', 'disabled');
        } else {
            $('#Register-button').removeAttr('disabled');
        }
    });

}


function setupSearchBar() {
    $("#advanced-search-toggle").click(function (e) {
        if ($("#main-search-input").hasClass("hidden")) {
            $("#main-search-input").removeClass("hidden");
            $('#search-bar-box').removeClass("search-box-out");
            $("#search-form").addClass("d-flex");

            $("#orighead-search-input").addClass("hidden");
            $("#origtail-search-input").addClass("hidden");
            $("#origedge-search-input").addClass("hidden");
            $("#head-search-input").addClass("hidden");
            $("#edge-search-input").addClass("hidden");
            $("#tail-search-input").addClass("hidden");

        } else {
            $("#main-search-input").addClass("hidden");
            $('#search-bar-box').addClass("search-box-out");
            $("#search-form").removeClass("d-flex");

            $("#orighead-search-input").removeClass("hidden");
            $("#origtail-search-input").removeClass("hidden");
            $("#origedge-search-input").removeClass("hidden");
            $("#head-search-input").removeClass("hidden");
            $("#edge-search-input").removeClass("hidden");
            $("#tail-search-input").removeClass("hidden");
        }
    });

    $("#search-form").submit(function (e) {
        //debounce(() => console.log($(this).val()), 2000);
        let elt = $(this)[0];
        let action = elt.action; // the url
        let value = $('#main-search-input').val();
        if ($("#main-search-input").hasClass("hidden")) {
            value = "{";
            let oh = $('#orighead-search-input');
            let ot = $('#origtail-search-input');
            let h = $('#head-search-input');
            let t = $('#tail-search-input');
            let ed = $('#edge-search-input');
            if (oh.val()) value += `"oh": "${oh.val()}", `;
            if (ot.val()) value += `"ot": "${ot.val()}", `;
            if (h.val()) value += `"h": "${h.val()}", `;
            if (t.val()) value += `"t": "${t.val()}", `;
            if (ed.val()) value += `"ed": "${ed.val()}", `;
            value = value.slice(0, -2);
            value += "}";
            if (value === "}") value = "{}";
            // console.log(value);
        }

        if (action.includes("filter_text=")) {
            action = action.replace(/filter_text={?[A-Za-z:\s"']*:?}?&?/gi, '').replace(/&$/, '');
        }

        if (action.includes("?")) action += `&filter_text=${value}`;
        else action += `?filter_text=${value}`;
        action = action.replace(/\?page=\d+/gi, '?page=1');
        action = action.replace(/&page=\d+/gi, '&page=1');
        //console.log(action)
        //console.log(value)

        if (value !== "") {
            e.preventDefault();
            $.ajax(
                {
                    url: action,
                    method: "GET",
                    data: {},
                    success: function (response) {
                        window.location.assign(action);
                    },
                    error: function (xhr, msg, err) {
                        console.dir(xhr);
                        console.dir(msg);
                        console.dir(err);
                    }
                }
            );
        }
    });
}

function setupJumpToPage() {
    $("#jump_to_page").click(function (e) {
        e.preventDefault();
        let jump_to_url = $(this).attr("href");
        let to_go_to = $('#jump_to_page_i').val();

        // check if it's a number even
        if (!isNaN(to_go_to)) {
            window.location = jump_to_url.replace("?page=", `?page=${to_go_to}`);
        } else {
            $.alert("Stran more bit število");
        }
    });

    $("#num_per_page").click(function (e) {
        e.preventDefault();
        let jump_to_url = $(this).attr("href");
        let to_go_to = $('#num_per_page_i').val();

        // check if it's a number even
        if (!isNaN(to_go_to)) {
            //window.location = jump_to_url.replace("perpage=", `perpage=${to_go_to}`);
            window.location = jump_to_url.replace(/(perpage=)\d+/, '$1' + to_go_to.toString())
        } else {
            $.alert("Stran more biti število");
        }
    });
}

function setupProgressBar(done = 0, left = 0) {
    if (left > done) left = done;
    $(".progress").each(function () {

        var $bar = $(this).find(".bar");
        var $val = $(this).find("span");
        var perc = parseInt($val.text(), 10);

        $({p: 0}).animate({p: perc}, {
            duration: 3000,
            easing: "swing",
            step: function (p) {
                $bar.css({
                    transform: "rotate(" + (45 + (p * 1.8)) + "deg)", // 100%=180° so: ° = % * 1.8
                    // 45 is to add the needed rotation to have the green borders at the bottom
                });
                $val.text(p | 0);
            }
        });
    });
}

function setupOKbuttons() {
    $('.record-parent a.btn:not(.closesynonims)').each(function (i, el) {
        let ddd = 0;
        if (!$._data($(el).get(0), "events")) {
            $(el).click(function (e) {
                $(`button#accordBtntc${$(el).attr('id').replace('isokbtn', '')}`).attr('data-bs-toggle', 'collapse');

                let acci = $(el).parents('.accordion-item').find('form');
                $.ajax({
                    url: '/Record/updateRecord',
                    method: 'POST',
                    data: acci.serialize() + "&unchanged=1",
                    success: function (response) {
                        let recParent = acci.parents('.record-parent');
                        recParent.addClass('edited-was-ok');
                        recParent.removeClass('marked-for-later');
                        $(acci).parents('.show').collapse('hide');
                        if (response?.numRecordsAssigned)
                            updateProgressBars(response.numRecordsAssigned)
                    },
                    error: function (xhr, msg, err) {
                        console.dir(xhr);
                        console.dir(msg);
                        console.dir(err);
                    }
                });

                $(el).remove(); // OK Button go bye
            });
        }
    });
}

function setupCommentsSelect() {
    $(document).on('change', '.commentsSelect', function () {
        console.log()
        let comm = $(this).val();
        if (comm !== 'defaultC')
            $(`#txtAreaComment${$(this).attr('id').replace('commentsSelect', '')}`).val(comm);
        else
            $(`#txtAreaComment${$(this).attr('id').replace('commentsSelect', '')}`).val('');
    });

}

if (typeof $ !== "undefined") {
    // temporary if ^
    $(function () {
        setupForms();
        setupOKbuttons();
        setupSynonyms();
        setupSearchBar();
        setupJumpToPage();
        setupBtnToCloseSynonims();
        setupProgressBar();
        setupCommentsSelect();
    });
}

