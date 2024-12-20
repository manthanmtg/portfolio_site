$(document).ready(function() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    $('input[type="date"]').val(today);

    // Initialize Select2 for tags
    $('.tags-select').select2({
        tags: true,
        tokenSeparators: [',', ' '],
        ajax: {
            url: '/get_tags',
            processResults: function(data) {
                return {
                    results: data.map(tag => ({id: tag, text: tag}))
                };
            }
        }
    });

    // Handle markdown preview
    let previewTimeout;
    $('.markdown-input').on('input', function() {
        const $input = $(this);
        const $preview = $input.closest('.row').find('.preview-area');
        
        clearTimeout(previewTimeout);
        previewTimeout = setTimeout(() => {
            $.ajax({
                url: '/preview',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ content: $input.val() }),
                success: function(response) {
                    $preview.html(response.html);
                }
            });
        }, 300);
    });

    // Handle reference fields
    let referenceCount = 0;
    
    function addReferenceFields() {
        const referenceHtml = `
            <div class="reference-item" data-ref-id="${referenceCount}">
                <div class="mb-2">
                    <label class="form-label">Reference Title</label>
                    <input type="text" class="form-control" name="reference_title_${referenceCount}" required>
                </div>
                <div class="mb-2">
                    <label class="form-label">URL</label>
                    <input type="url" class="form-control" name="reference_url_${referenceCount}" required>
                </div>
                <button type="button" class="btn btn-danger btn-sm remove-reference">Remove</button>
            </div>
        `;
        $('#referencesContainer').append(referenceHtml);
        referenceCount++;
    }

    $('#addReference').click(addReferenceFields);

    $(document).on('click', '.remove-reference', function() {
        $(this).closest('.reference-item').remove();
    });

    // Handle TIL form submission
    $('#tilForm').on('submit', function(e) {
        e.preventDefault();
        
        // Collect references
        const references = [];
        $('.reference-item').each(function() {
            const refId = $(this).data('ref-id');
            references.push({
                title: $(this).find(`[name="reference_title_${refId}"]`).val(),
                url: $(this).find(`[name="reference_url_${refId}"]`).val()
            });
        });

        const formData = {
            title: $(this).find('[name="title"]').val(),
            date: $(this).find('[name="date"]').val(),
            notes_name: $(this).find('[name="notes_name"]').val(),
            tags: $(this).find('[name="tags"]').val(),
            difficulty: $(this).find('[name="difficulty"]').val(),
            references: references,
            content: $(this).find('[name="content"]').val(),
            notes: $(this).find('[name="notes"]').val()
        };

        $.ajax({
            url: '/submit_til',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function(response) {
                if (response.status === 'success') {
                    alert('TIL entry saved successfully!');
                    $('#tilForm')[0].reset();
                    $('.tags-select').val(null).trigger('change');
                    $('#referencesContainer').empty();
                    $('input[type="date"]').val(today);
                }
            }
        });
    });

    // Handle TOTD form submission
    $('#totdForm').on('submit', function(e) {
        e.preventDefault();
        const formData = {
            name: $(this).find('[name="name"]').val(),
            date: $(this).find('[name="date"]').val(),
            notes_name: $(this).find('[name="notes_name"]').val(),
            category: $(this).find('[name="category"]').val(),
            tags: $(this).find('[name="tags"]').val(),
            description: $(this).find('[name="description"]').val(),
            notes: $(this).find('[name="notes"]').val()
        };

        $.ajax({
            url: '/submit_totd',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function(response) {
                if (response.status === 'success') {
                    alert('TOTD entry saved successfully!');
                    $('#totdForm')[0].reset();
                    $('.tags-select').val(null).trigger('change');
                    $('input[type="date"]').val(today);
                }
            }
        });
    });
});
