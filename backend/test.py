def reverse_number(num):
  # Reverse the number
  reverse=0
  while num > 0:
    
    
    reverse = reverse * 10 + num%10
    
    num = num // 10
  
  return reverse

## Example usage:
print(reverse_number(1223)) # Output: 3221
print(reverse_number(987654321)) # Output: 123456789