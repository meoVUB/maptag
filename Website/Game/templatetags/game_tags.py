from django import template

register = template.Library()

@register.filter(name='truncate_words')
def truncate_words(value, max_words):
    words = value.split()
    if len(words) > max_words:
        return ' '.join(words[:max_words]) + ' ...'
    return value