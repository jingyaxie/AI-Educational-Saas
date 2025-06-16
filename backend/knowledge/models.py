from django.db import models

class KnowledgeFile(models.Model):
    filename = models.CharField(max_length=255)
    file = models.FileField(upload_to='knowledge_files/')
    kb = models.ForeignKey('users.KnowledgeBase', on_delete=models.CASCADE, related_name='knowledge_files')
    char_count = models.IntegerField(default=0)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created']

    def __str__(self):
        return self.filename

class KnowledgeSegment(models.Model):
    file = models.ForeignKey(KnowledgeFile, on_delete=models.CASCADE, related_name='segments')
    content = models.TextField()
    tags = models.JSONField(default=list, blank=True)
    enabled = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"Segment {self.id} of {self.file}"
    # ... existing code ... 